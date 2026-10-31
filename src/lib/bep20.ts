export const BEP20_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
export const BEP20_NETWORK_LABEL = "BEP20 · BNB Smart Chain";
export const BSC_EXPLORER_URL = "https://bscscan.com";

export function isBep20Address(value: string) {
  return BEP20_ADDRESS_PATTERN.test(value.trim());
}

export function bscScanTxUrl(txHash: string) {
  return `${BSC_EXPLORER_URL}/tx/${encodeURIComponent(txHash)}`;
}

export function bscScanAddressUrl(address: string) {
  return `${BSC_EXPLORER_URL}/address/${encodeURIComponent(address)}`;
}

export function isWithdrawalSettled(status: string) {
  return status === "COMPLETED" || status === "APPROVED" || status === "SUCCESS";
}

export function isWithdrawalPending(status: string) {
  return status === "PENDING" || status === "PROCESSING";
}
