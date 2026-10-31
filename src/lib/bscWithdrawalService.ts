import {
  Contract,
  JsonRpcProvider,
  NonceManager,
  Wallet,
  formatUnits,
  getAddress,
  isAddress,
  parseUnits,
} from "ethers";

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

export class BscWithdrawalError extends Error {
  code: string;
  txHash?: string;
  broadcasted: boolean;

  constructor(
    message: string,
    code: string,
    options: { txHash?: string; broadcasted?: boolean } = {}
  ) {
    super(message);
    this.name = "BscWithdrawalError";
    this.code = code;
    this.txHash = options.txHash;
    this.broadcasted = Boolean(options.broadcasted);
  }
}

interface BscConfig {
  enabled: boolean;
  rpcUrl: string;
  privateKey: string;
  tokenAddress: string;
  chainId: number;
  confirmations: number;
  explorerUrl: string;
}

let provider: JsonRpcProvider | null = null;
let providerUrl = "";
let sendQueue: Promise<unknown> = Promise.resolve();

function readConfig(): BscConfig {
  const enabled = process.env.BSC_WITHDRAWALS_ENABLED === "true";
  const rpcUrl = (process.env.BSC_RPC_URL || "").trim();
  const privateKey = (process.env.HOT_WALLET_PRIVATE_KEY || "").trim();
  const tokenAddress = (
    process.env.BEP20_TOKEN_CONTRACT_ADDRESS ||
    "0x55d398326f99059fF775485246999027B3197955"
  ).trim();
  const rawChainId = Number(process.env.BSC_CHAIN_ID || 56);
  const chainId =
    Number.isInteger(rawChainId) && rawChainId > 0 ? rawChainId : 56;
  const rawConfirmations = Number(process.env.BSC_CONFIRMATIONS || 1);
  const confirmations = Number.isFinite(rawConfirmations)
    ? Math.min(30, Math.max(1, Math.floor(rawConfirmations)))
    : 1;
  const explorerUrl = (
    process.env.BSC_EXPLORER_URL ||
    (chainId === 56 ? "https://bscscan.com" : "https://testnet.bscscan.com")
  ).replace(/\/$/, "");

  return {
    enabled,
    rpcUrl,
    privateKey,
    tokenAddress,
    chainId,
    confirmations,
    explorerUrl,
  };
}

function isUsablePrivateKey(value: string) {
  if (!value) return false;
  try {
    new Wallet(value);
    return true;
  } catch {
    return false;
  }
}

export function getBscWithdrawalStatus() {
  const config = readConfig();
  return {
    enabled: config.enabled,
    configured: Boolean(
      config.rpcUrl && isUsablePrivateKey(config.privateKey) && isAddress(config.tokenAddress)
    ),
    chainId: config.chainId,
    tokenAddress: isAddress(config.tokenAddress) ? getAddress(config.tokenAddress) : null,
    rpcHost: (() => {
      try {
        return new URL(config.rpcUrl).host;
      } catch {
        return null;
      }
    })(),
    explorerUrl: config.explorerUrl,
  };
}

export function isValidBep20Address(value: string) {
  return isAddress(value);
}

function getProvider(config: BscConfig) {
  if (!provider || providerUrl !== config.rpcUrl) {
    provider = new JsonRpcProvider(config.rpcUrl);
    providerUrl = config.rpcUrl;
  }
  return provider;
}

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = sendQueue.then(task, task);
  sendQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function redactSecrets(message: string) {
  const config = readConfig();
  let output = message;
  if (config.privateKey) output = output.split(config.privateKey).join("[redacted-key]");
  if (config.rpcUrl) output = output.split(config.rpcUrl).join("[redacted-rpc]");
  return output.slice(0, 240);
}

function asWithdrawalError(error: unknown) {
  if (error instanceof BscWithdrawalError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (/insufficient funds/i.test(message)) {
    return new BscWithdrawalError(
      "Hot wallet has insufficient BNB for gas fees.",
      "INSUFFICIENT_GAS"
    );
  }
  if (/insufficient allowance|transfer amount exceeds balance/i.test(message)) {
    return new BscWithdrawalError(
      "Hot wallet has insufficient BEP20 token balance.",
      "INSUFFICIENT_TOKEN"
    );
  }
  if (/timeout|timed out|ETIMEDOUT/i.test(message)) {
    return new BscWithdrawalError(
      "BSC RPC timed out. Please retry after checking the transaction status.",
      "RPC_TIMEOUT"
    );
  }
  if (/nonce/i.test(message)) {
    return new BscWithdrawalError(
      "BSC nonce error. Please retry after checking pending transactions.",
      "NONCE_ERROR"
    );
  }
  return new BscWithdrawalError(
    `BSC transfer failed: ${redactSecrets(message)}`,
    "TRANSFER_FAILED"
  );
}

export async function sendBep20Withdrawal(params: {
  to: string;
  amount: number;
}) {
  return serialize(async () => {
    const config = readConfig();
    if (!config.enabled) {
      throw new BscWithdrawalError(
        "Automatic BSC withdrawals are disabled. Set BSC_WITHDRAWALS_ENABLED=true.",
        "AUTO_WITHDRAWALS_DISABLED"
      );
    }
    if (!config.rpcUrl || !config.privateKey) {
      throw new BscWithdrawalError(
        "BSC withdrawal wallet is not configured. Set BSC_RPC_URL and HOT_WALLET_PRIVATE_KEY.",
        "NOT_CONFIGURED"
      );
    }
    if (!isUsablePrivateKey(config.privateKey)) {
      throw new BscWithdrawalError(
        "HOT_WALLET_PRIVATE_KEY is not a valid wallet private key.",
        "INVALID_PRIVATE_KEY"
      );
    }
    if (!isAddress(config.tokenAddress)) {
      throw new BscWithdrawalError("Invalid BEP20 token contract address.", "INVALID_TOKEN");
    }
    if (!isAddress(params.to)) {
      throw new BscWithdrawalError("Invalid BEP20 recipient address.", "INVALID_ADDRESS");
    }
    if (!Number.isFinite(params.amount) || params.amount <= 0) {
      throw new BscWithdrawalError("Invalid withdrawal amount.", "INVALID_AMOUNT");
    }

    try {
      const rpc = getProvider(config);
      const network = await rpc.getNetwork();
      if (Number(network.chainId) !== config.chainId) {
        throw new BscWithdrawalError(
          `Wrong BSC network: RPC is chain ${network.chainId}, expected ${config.chainId}.`,
          "WRONG_NETWORK"
        );
      }

      const hotWallet = new Wallet(config.privateKey, rpc);
      const signer = new NonceManager(hotWallet);
      const token = new Contract(config.tokenAddress, ERC20_ABI, signer);
      const recipient = getAddress(params.to);

      const code = await rpc.getCode(config.tokenAddress);
      if (!code || code === "0x") {
        throw new BscWithdrawalError(
          "BEP20 token contract was not found on this network.",
          "TOKEN_NOT_FOUND"
        );
      }

      let decimals = 18;
      try {
        const value = await token.decimals();
        const parsed = Number(value);
        if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 36) decimals = parsed;
      } catch {
        decimals = 18;
      }

      const amountString = params.amount.toFixed(Math.min(decimals, 6));
      const parsedAmount = parseUnits(amountString, decimals);
      if (parsedAmount <= 0n) {
        throw new BscWithdrawalError("Withdrawal amount is too small.", "INVALID_AMOUNT");
      }

      const [tokenBalance, nativeBalance, feeData] = await Promise.all([
        token.balanceOf(hotWallet.address),
        rpc.getBalance(hotWallet.address),
        rpc.getFeeData(),
      ]);
      if (tokenBalance < parsedAmount) {
        throw new BscWithdrawalError(
          `Hot wallet token balance is low. Available ${formatUnits(
            tokenBalance,
            decimals
          )}; required ${formatUnits(parsedAmount, decimals)}.`,
          "INSUFFICIENT_TOKEN"
        );
      }

      const gasLimit = await token.transfer.estimateGas(recipient, parsedAmount);
      const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice ?? 0n;
      const gasCost = (gasLimit * gasPrice * 120n) / 100n;
      if (gasCost > 0n && nativeBalance < gasCost) {
        throw new BscWithdrawalError(
          `Hot wallet BNB gas is low. Required approximately ${formatUnits(
            gasCost,
            18
          )} BNB.`,
          "INSUFFICIENT_GAS"
        );
      }

      const tx = await token.transfer(recipient, parsedAmount);
      const txHash = String(tx.hash);
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const receipt = await Promise.race([
          tx.wait(config.confirmations),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(
              () =>
                reject(
                  new BscWithdrawalError(
                    "Transaction was broadcast but confirmation timed out. Verify the txHash on BscScan before retrying.",
                    "CONFIRMATION_FAILED",
                    { txHash, broadcasted: true }
                  )
                ),
              180_000
            );
          }),
        ]);
        if (!receipt || receipt.status !== 1) {
          throw new BscWithdrawalError(
            "BSC transaction reverted on-chain.",
            "TRANSACTION_REVERTED",
            { txHash, broadcasted: true }
          );
        }
        return {
          success: true,
          txHash: receipt.hash || txHash,
          hotWallet: hotWallet.address,
          explorerUrl: `${config.explorerUrl}/tx/${receipt.hash || txHash}`,
        };
      } catch (waitError) {
        if (waitError instanceof BscWithdrawalError) throw waitError;
        const failedReceipt = (waitError as { receipt?: { status?: number } }).receipt;
        if (failedReceipt?.status === 0 || /reverted/i.test(String(waitError))) {
          throw new BscWithdrawalError(
            "BSC transaction reverted on-chain.",
            "TRANSACTION_REVERTED",
            { txHash, broadcasted: true }
          );
        }
        throw new BscWithdrawalError(
          "Transaction was broadcast but confirmation failed. Verify the txHash on BscScan before retrying.",
          "CONFIRMATION_FAILED",
          { txHash, broadcasted: true }
        );
      } finally {
        if (timeout) clearTimeout(timeout);
      }
    } catch (error) {
      throw asWithdrawalError(error);
    }
  });
}

export async function verifyBep20Transaction(txHash: string) {
  const config = readConfig();
  if (!config.enabled || !config.rpcUrl) {
    throw new BscWithdrawalError(
      "BSC withdrawal verification is not configured.",
      "NOT_CONFIGURED"
    );
  }
  const rpc = getProvider(config);
  const receipt = await rpc.getTransactionReceipt(txHash);
  if (!receipt) {
    return { confirmed: false, success: false, txHash };
  }
  const currentBlock = await rpc.getBlockNumber();
  const confirmations = Math.max(0, currentBlock - receipt.blockNumber + 1);
  return {
    confirmed: confirmations >= config.confirmations,
    success: receipt.status === 1,
    txHash,
    blockNumber: receipt.blockNumber,
    confirmations,
  };
}
