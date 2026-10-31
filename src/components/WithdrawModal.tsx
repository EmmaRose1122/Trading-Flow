"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Star,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import type { PayoutWallet, Transaction } from "@/lib/db";
import { MIN_WITHDRAWAL } from "@/lib/deposit";
import {
  BEP20_NETWORK_LABEL,
  bscScanTxUrl,
  isBep20Address,
  isWithdrawalPending,
  isWithdrawalSettled,
} from "@/lib/bep20";

interface WithdrawModalProps {
  isOpen: boolean;
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

function historyTone(status: Transaction["status"]) {
  if (isWithdrawalSettled(status)) return "border-red-400 bg-red-100 text-red-800";
  if (isWithdrawalPending(status)) return "border-amber-400 bg-amber-100 text-amber-800";
  return "border-rose-400 bg-rose-100 text-rose-800";
}

function HistoryIcon({ status }: { status: Transaction["status"] }) {
  if (isWithdrawalSettled(status)) return <CheckCircle2 className="h-3 w-3" />;
  if (status === "PROCESSING") return <Clock className="h-3 w-3 animate-pulse" />;
  if (isWithdrawalPending(status)) return <Clock className="h-3 w-3" />;
  return <XCircle className="h-3 w-3" />;
}

export default function WithdrawModal({
  isOpen,
  currentBalance,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [payoutWallets, setPayoutWallets] = useState<PayoutWallet[]>([]);
  const [walletId, setWalletId] = useState("");
  const [kycStatus, setKycStatus] = useState("NOT_STARTED");
  const [history, setHistory] = useState<Transaction[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError("");
    setWalletId("");
    setAmount("");
    setDestination("");
    setMetaLoading(true);

    Promise.all([
      fetch("/api/user/wallets", { cache: "no-store" }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load payout wallets");
        return Array.isArray(data.wallets) ? (data.wallets as PayoutWallet[]) : [];
      }),
      fetch("/api/user/kyc", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) return "NOT_STARTED";
        const data = await response.json();
        return typeof data.status === "string" ? data.status : "NOT_STARTED";
      }),
      fetch("/api/transactions", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) return [];
          const data = await response.json();
          return Array.isArray(data.transactions) ? (data.transactions as Transaction[]) : [];
        })
        .catch(() => [] as Transaction[]),
    ])
      .then(([wallets, kyc, transactions]) => {
        if (cancelled) return;
        const bep20Wallets = wallets.filter((wallet) => isBep20Address(wallet.address));
        setPayoutWallets(bep20Wallets);
        setKycStatus(kyc);
        setHistory(
          transactions
            .filter((transaction) => transaction.type === "WITHDRAWAL")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4)
        );
        const preferred =
          bep20Wallets.find((wallet) => wallet.isProfitDestination) || bep20Wallets[0];
        if (preferred) {
          setWalletId(preferred.id);
          setDestination(preferred.address);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load payout wallets");
        }
      })
      .finally(() => {
        if (!cancelled) setMetaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedWallet = payoutWallets.find((wallet) => wallet.id === walletId) || null;
  const payoutAddress = selectedWallet ? selectedWallet.address : destination.trim();
  const addressValid = isBep20Address(payoutAddress);
  const numAmount = parseFloat(amount) || 0;
  const fee = +(numAmount * 0.02).toFixed(2);
  const netReceive = numAmount;
  const totalDeduction = +(numAmount + fee).toFixed(2);
  const maxWithdrawal = Math.max(0, Math.floor((currentBalance / 1.02) * 100) / 100);
  const kycApproved = kycStatus === "APPROVED";
  const canSubmit =
    kycApproved &&
    !metaLoading &&
    addressValid &&
    numAmount >= MIN_WITHDRAWAL &&
    totalDeduction <= currentBalance;

  const selectWallet = (nextId: string) => {
    setWalletId(nextId);
    const wallet = payoutWallets.find((entry) => entry.id === nextId);
    setDestination(wallet ? wallet.address : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!kycApproved) {
      setError("KYC verification must be approved before you can withdraw funds.");
      return;
    }

    if (numAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}.00`);
      return;
    }

    if (totalDeduction > currentBalance) {
      setError(`Insufficient balance. Amount plus $${fee.toFixed(2)} fee exceeds your available balance.`);
      return;
    }

    if (!addressValid) {
      setError("Enter a valid BEP20 wallet address starting with 0x and containing 40 hexadecimal characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          destination: payoutAddress,
          payoutWalletId: selectedWallet?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Withdrawal request failed");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/35 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-red-900/20 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#5B1B1B] hover:text-[#2B0B0E]"
          aria-label="Close withdrawal form"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#2B0B0E] mb-1">Withdraw via BEP20</h3>
        <p className="text-xs text-[#5B1B1B] mb-4">
          Requests are reviewed by an administrator, then broadcast automatically to your BEP20
          wallet on BNB Smart Chain.
        </p>

        <div className="mb-4 p-3.5 rounded-xl bg-[#FFF5F5] border border-red-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-100 text-red-800">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#5B1B1B] block">
                Available Wallet Balance
              </span>
              <span className="font-bold text-base text-[#2B0B0E]">
                ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAmount(maxWithdrawal.toFixed(2))}
            className="text-xs font-semibold text-red-800 hover:underline"
          >
            Max All
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-900/20 bg-white px-3 py-2 text-[10px] text-[#6B1D1D]">
          <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold uppercase text-red-800">
            {BEP20_NETWORK_LABEL}
          </span>
          <span>Only 0x BEP20 addresses are supported for automated payouts.</span>
        </div>

        {!kycApproved && !metaLoading && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {kycStatus === "PENDING"
                ? "Your identity verification is under review. Withdrawals unlock after approval."
                : kycStatus === "REJECTED"
                  ? "Your identity verification was rejected. Resubmit it from Account settings to unlock withdrawals."
                  : "Identity verification is required before withdrawing. Complete KYC in Account settings."}
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
              Payout wallet
            </label>
            {metaLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-900/20 bg-white px-3 py-3 text-xs text-[#5B1B1B]">
                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Loading saved wallets...
              </div>
            ) : (
              <select
                value={walletId}
                onChange={(event) => selectWallet(event.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] text-sm focus:outline-none focus:border-red-700"
              >
                {payoutWallets.length > 0 && (
                  <option value="">Use a different BEP20 address</option>
                )}
                {payoutWallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.label} · BEP20
                    {wallet.isProfitDestination ? " (profit destination)" : ""}
                  </option>
                ))}
                {payoutWallets.length === 0 && (
                  <option value="">Enter an external BEP20 address</option>
                )}
              </select>
            )}
            {selectedWallet?.isProfitDestination && (
              <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-red-800">
                <Star className="w-3 h-3" />
                This is your preferred profit payout destination.
              </p>
            )}
            {!metaLoading && payoutWallets.length === 0 && (
              <p className="mt-1.5 text-[10px] text-[#6B1D1D]">
                No BEP20 payout wallet saved yet. Add one in{" "}
                <a href="/settings#payout-wallets" className="font-semibold text-red-800 underline">
                  Account settings
                </a>
                .
              </p>
            )}
          </div>

          {selectedWallet ? (
            <div className="rounded-xl bg-[#FFF5F5] border border-red-900/20 p-3">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[#5B1B1B]">Destination</span>
                <span className="text-[#3F1414]">BEP20 · BSC</span>
              </div>
              <p className="mt-1.5 break-all font-mono text-xs text-red-800">
                {selectedWallet.address}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
                BEP20 Recipient Address
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="0x..."
                spellCheck={false}
                autoComplete="off"
                className={`w-full px-4 py-2.5 rounded-xl bg-white border text-[#2B0B0E] placeholder-[#8A4A4A] text-sm font-mono focus:outline-none focus:border-red-700 ${
                  destination && !addressValid ? "border-rose-400" : "border-red-900/20"
                }`}
              />
              {destination && !addressValid && (
                <p className="mt-1 text-[10px] font-semibold text-rose-600">
                  Enter a valid 42-character BEP20 address starting with 0x.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
              Withdrawal Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#6B1D1D] text-sm font-semibold">$</span>
              <input
                type="number"
                min={MIN_WITHDRAWAL}
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
              />
            </div>
          </div>

          <div className="rounded-xl bg-rose-50 border border-red-900/20 px-3 py-2 text-[10px] text-[#6B1D1D]">
            One withdrawal request is allowed every 24 hours. Minimum ${MIN_WITHDRAWAL}.00. Your
            balance is debited when the request is submitted and refunded automatically if an
            administrator rejects it.
          </div>

          <div className="p-3 rounded-xl bg-rose-50 border border-red-900/20 space-y-1.5 text-xs text-[#5B1B1B]">
            <div className="flex justify-between">
              <span>Network Handling Fee (2%):</span>
              <span className="font-semibold text-[#2B0B0E]">${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-red-900/20 font-semibold text-[#2B0B0E]">
              <span>Net Estimated Payout:</span>
              <span className="text-red-800">${netReceive.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#6B1D1D]">
              <span>Total Wallet Deduction:</span>
              <span>${totalDeduction.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
          >
            {loading ? "Submitting request..." : "Request BEP20 Withdrawal"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {history.length > 0 && (
          <div className="mt-5 border-t border-red-900/20 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B1B1B]">
                Recent withdrawals
              </h4>
              <a href="/transactions" className="text-[10px] font-semibold text-red-800 hover:underline">
                Full history
              </a>
            </div>
            <ul className="space-y-2">
              {history.map((withdrawal) => (
                <li
                  key={withdrawal.id}
                  className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2B0B0E]">
                      ${withdrawal.amount.toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${historyTone(
                        withdrawal.status
                      )}`}
                    >
                      <HistoryIcon status={withdrawal.status} />
                      {withdrawal.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[10px] text-[#6B1D1D]">
                    <span>{new Date(withdrawal.createdAt).toLocaleString("en-SG")}</span>
                    {withdrawal.txHash ? (
                      <a
                        href={bscScanTxUrl(withdrawal.txHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-red-800 hover:underline"
                      >
                        View on BscScan
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="font-mono">{withdrawal.id}</span>
                    )}
                  </div>
                  {withdrawal.errorMessage && (
                    <p className="mt-1 text-[10px] text-rose-700">{withdrawal.errorMessage}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
