"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { InvestmentPlan } from "@/lib/db";

interface InvestModalProps {
  plan: InvestmentPlan | null;
  currentBalance: number;
  initialAmount?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvestModal({
  plan,
  currentBalance,
  initialAmount = "",
  isOpen,
  onClose,
  onSuccess,
}: InvestModalProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount);
      setError("");
    }
  }, [isOpen, plan?.id, initialAmount]);

  if (!isOpen || !plan) return null;

  const numAmount = parseFloat(amount) || 0;
  const dailyProfit = +((numAmount * plan.dailyPercentage) / 100).toFixed(2);
  const totalProfit = +(dailyProfit * plan.durationDays).toFixed(2);
  const totalPayout = +(numAmount + totalProfit).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (numAmount < plan.minAmount || numAmount > plan.maxAmount) {
      setError(`Amount must be between $${plan.minAmount} and $${plan.maxAmount}`);
      return;
    }

    if (numAmount > currentBalance) {
      setError(`Insufficient balance. You currently have $${currentBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/investments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, amount: numAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription failed");
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

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Subscribe: {plan.name}</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Lock in your capital for {plan.durationDays} days at {plan.dailyPercentage.toFixed(1)}% daily returns.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold uppercase text-slate-400">Investment Capital (USD)</span>
              <span className="text-slate-400">
                Wallet:{" "}
                <strong className="text-emerald-400">
                  ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">$</span>
              <input
                type="number"
                min={plan.minAmount}
                max={plan.maxAmount}
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Range: $${plan.minAmount} - $${plan.maxAmount}`}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Interactive Projected Return Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[11px]">
              Contract Return Projection
            </span>
            <div className="flex justify-between text-slate-400">
              <span>Daily ROI ({plan.dailyPercentage.toFixed(1)}%):</span>
              <span className="font-semibold text-emerald-400">+${dailyProfit.toFixed(2)} / day</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Duration Period:</span>
              <span className="font-semibold text-slate-200">{plan.durationDays} Days</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Estimated Profit:</span>
              <span className="font-semibold text-cyan-400">+${totalProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/5 text-sm font-bold text-white">
              <span>Total Payout (With Principal):</span>
              <span className="text-emerald-400">${totalPayout.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? "Locking in Capital..." : "Confirm & Activate Contract"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

