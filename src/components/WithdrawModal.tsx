"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, ShieldAlert, Wallet, Star } from "lucide-react";
import type { PayoutWallet } from "@/lib/db";
import { MIN_WITHDRAWAL } from "@/lib/deposit";

interface WithdrawModalProps {
  isOpen: boolean;
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawModal({
  isOpen,
  currentBalance,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  const [method, setMethod] = useState("USDT (TRC20)");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [payoutWallets, setPayoutWallets] = useState<PayoutWallet[]>([]);
  const [walletId, setWalletId] = useState("");
  const [kycStatus, setKycStatus] = useState("NOT_STARTED");
  const [metaLoading, setMetaLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError("");
    setWalletId("");
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
    ])
      .then(([wallets, kyc]) => {
        if (cancelled) return;
        setPayoutWallets(wallets);
        setKycStatus(kyc);
        const preferred = wallets.find((wallet) => wallet.isProfitDestination) || wallets[0];
        if (preferred) {
          setWalletId(preferred.id);
          setMethod(preferred.method);
          setDestination(preferred.address);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load payout wallets");
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
  const numAmount = parseFloat(amount) || 0;
  const fee = +(numAmount * 0.02).toFixed(2);
  const netReceive = numAmount;
  const totalDeduction = +(numAmount + fee).toFixed(2);
  const maxWithdrawal = Math.max(0, Math.floor((currentBalance / 1.02) * 100) / 100);
  const kycApproved = kycStatus === "APPROVED";
  const canSubmit = kycApproved && !metaLoading && (selectedWallet || destination.trim().length >= 6);

  const selectWallet = (nextId: string) => {
    setWalletId(nextId);
    const wallet = payoutWallets.find((entry) => entry.id === nextId);
    if (wallet) {
      setMethod(wallet.method);
      setDestination(wallet.address);
    } else {
      setMethod("USDT (TRC20)");
      setDestination("");
    }
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

    if (!selectedWallet && destination.trim().length < 6) {
      setError("Select a saved payout wallet or enter a valid destination address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          method,
          destination,
          payoutWalletId: selectedWallet?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Withdrawal request failed");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
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
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#2B0B0E] mb-1">Withdraw Capital</h3>
        <p className="text-xs text-[#5B1B1B] mb-4">
          Request a withdrawal to your saved payout wallet or an external address.
        </p>

        {/* Balance Card */}
        <div className="mb-4 p-3.5 rounded-xl bg-white border border-red-900/20 flex items-center justify-between">
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

        {!kycApproved && !metaLoading && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
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
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
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
                  <option value="">Use a different address</option>
                )}
                {payoutWallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.label} · {wallet.method}
                    {wallet.isProfitDestination ? " (profit destination)" : ""}
                  </option>
                ))}
                {payoutWallets.length === 0 && (
                  <option value="">Enter an external address</option>
                )}
              </select>
            )}
            {selectedWallet?.isProfitDestination && (
              <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-red-800">
                <Star className="w-3 h-3" />
                This is your preferred profit payout destination.
              </p>
            )}
          </div>

          {selectedWallet ? (
            <div className="rounded-xl bg-white border border-red-900/20 p-3">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[#5B1B1B]">Destination</span>
                <span className="text-[#3F1414]">
                  {selectedWallet.method}
                  {selectedWallet.network ? ` · ${selectedWallet.network}` : ""}
                </span>
              </div>
              <p className="mt-1.5 break-all font-mono text-xs text-red-800">
                {selectedWallet.address}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
                  Payout Network
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] text-sm focus:outline-none focus:border-red-700"
                >
                  <option value="USDT (TRC20)">Tether USDT (TRC20)</option>
                  <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                  <option value="USDT (ERC20)">Tether USDT (ERC20)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
                  Recipient Destination Address
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={`Enter your ${method} address`}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm font-mono focus:outline-none focus:border-red-700"
                />
              </div>
            </>
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
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
              />
            </div>
          </div>

          <div className="rounded-xl bg-rose-50 border border-red-900/20 px-3 py-2 text-[10px] text-[#6B1D1D]">
            One withdrawal request is allowed every 24 hours. Minimum ${MIN_WITHDRAWAL}.00.
          </div>

          {/* Fee breakdown */}
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
            {loading ? "Processing..." : "Confirm Withdrawal Request"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
