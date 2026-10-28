"use client";

import { useState } from "react";
import { X, ArrowRight, ShieldAlert, Wallet } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const fee = +(numAmount * 0.02).toFixed(2);
  const netReceive = numAmount;
  const totalDeduction = +(numAmount + fee).toFixed(2);
  const maxWithdrawal = Math.max(0, Math.floor((currentBalance / 1.02) * 100) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (numAmount < 20) {
      setError("Minimum withdrawal amount is $20.00");
      return;
    }

    if (totalDeduction > currentBalance) {
      setError(`Insufficient balance. Amount plus $${fee.toFixed(2)} fee exceeds your available balance.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount, method, destination }),
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
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-white/10 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Withdraw Capital</h3>
        <p className="text-xs text-slate-400 mb-4">
          Request a direct withdrawal to your external wallet or exchange.
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

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
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

