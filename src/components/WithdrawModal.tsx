"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, ShieldAlert, Wallet, Star } from "lucide-react";
import type { PayoutWallet } from "@/lib/db";

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

    if (numAmount < 20) {
      setError("Minimum withdrawal amount is $20.00");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-white/10 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Withdraw Capital</h3>
        <p className="text-xs text-slate-400 mb-4">
          Request a withdrawal to your saved payout wallet or an external address.
        </p>

        {/* Balance Card */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                Available Wallet Balance
              </span>
              <span className="font-bold text-base text-white">
                ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAmount(maxWithdrawal.toFixed(2))}
            className="text-xs font-semibold text-emerald-400 hover:underline"
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
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Payout wallet
            </label>
            {metaLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-xs text-slate-400">
                <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                Loading saved wallets...
              </div>
            ) : (
              <select
                value={walletId}
                onChange={(event) => selectWallet(event.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
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
              <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <Star className="w-3 h-3" />
                This is your preferred profit payout destination.
              </p>
            )}
          </div>

          {selectedWallet ? (
            <div className="rounded-xl bg-slate-900 border border-white/5 p-3">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">Destination</span>
                <span className="text-slate-300">
                  {selectedWallet.method}
                  {selectedWallet.network ? ` · ${selectedWallet.network}` : ""}
                </span>
              </div>
              <p className="mt-1.5 break-all font-mono text-xs text-emerald-300">
                {selectedWallet.address}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Payout Network
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="USDT (TRC20)">Tether USDT (TRC20)</option>
                  <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                  <option value="USDT (ERC20)">Tether USDT (ERC20)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Recipient Destination Address
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={`Enter your ${method} address`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Withdrawal Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">$</span>
              <input
                type="number"
                min="20"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Network Handling Fee (2%):</span>
              <span className="font-semibold text-slate-200">${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/5 font-semibold text-white">
              <span>Net Estimated Payout:</span>
              <span className="text-emerald-400">${netReceive.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Total Wallet Deduction:</span>
              <span>${totalDeduction.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Withdrawal Request"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
