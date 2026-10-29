"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { Calculator, Check, Clock, Shield, TrendingUp, Wallet } from "lucide-react";
import type { InvestmentPlan, User } from "@/lib/db";
import { DAILY_RETURN_PERCENT, MIN_DEPOSIT } from "@/lib/deposit";

export default function PlansPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<InvestmentPlan | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [calculatorAmount, setCalculatorAmount] = useState("10");

  const loadData = useCallback(async () => {
    setLoadError("");
    try {
      const authRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!authRes.ok) {
        router.replace("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setCurrentBalance(authData.wallet?.currentBalance || 0);

      const plansRes = await fetch("/api/investments/plans", { cache: "no-store" });
      if (!plansRes.ok) throw new Error("Unable to load the daily plan.");
      const plansData = await plansRes.json();
      if (!Array.isArray(plansData.plans) || plansData.plans.length === 0) {
        throw new Error("The daily plan is currently unavailable.");
      }
      setPlan(plansData.plans[0]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to load the daily plan.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const parsedAmount = Number.parseFloat(calculatorAmount);
  const amount = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0;
  const dailyProfit = Math.round(((amount * DAILY_RETURN_PERCENT) / 100) * 100) / 100;
  const weeklyProfit = Math.round(dailyProfit * 7 * 100) / 100;
  const monthlyProfit = Math.round(dailyProfit * 30 * 100) / 100;
  const calculatorValid = amount >= MIN_DEPOSIT;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#FFFFFF]">
        <Navbar user={user} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#2B0B0E]">Plan could not be loaded</h1>
          <p className="mt-2 text-sm text-[#5B1B1B]">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="mt-6 px-5 py-2.5 rounded-xl bg-red-700 text-white text-sm font-bold"
          >
            Retry
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-100 text-red-800 border border-red-400 mb-3 inline-block">
            One Simple Daily Plan
          </span>
          <h1 className="text-3xl font-extrabold text-[#2B0B0E] tracking-tight sm:text-4xl">
            Deposit from $10, earn 2% every day
          </h1>
          <p className="mt-3 text-sm text-[#5B1B1B] leading-relaxed">
            Every approved deposit starts earning 2% daily after 24 hours. Add more at any time —
            there is no maximum. Daily profit is credited to your wallet automatically.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border-red-400">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-400 text-red-800 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B0B0E]">2% Daily Profit Calculator</h2>
              <p className="text-xs text-[#5B1B1B]">
                Enter any deposit amount from ${MIN_DEPOSIT} to see the daily return.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
                Deposit Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#6B1D1D] text-sm font-semibold">$</span>
                <input
                  type="number"
                  min={MIN_DEPOSIT}
                  step="any"
                  value={calculatorAmount}
                  onChange={(event) => setCalculatorAmount(event.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
                />
              </div>
              <p className={`mt-1.5 text-[11px] ${calculatorValid ? "text-[#6B1D1D]" : "text-amber-400"}`}>
                Minimum ${MIN_DEPOSIT}.00 · no maximum deposit limit
              </p>
            </div>

            <div className="rounded-xl bg-red-100 border border-red-400 p-3">
              <span className="text-[10px] uppercase tracking-wider text-red-800 font-semibold block">
                Daily Profit
              </span>
              <span className="text-xl font-bold text-[#2B0B0E] block mt-1">
                +${dailyProfit.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#5B1B1B]">2% of deposit</span>
            </div>
            <div className="rounded-xl bg-rose-50 border border-red-900/20 p-3">
              <span className="text-[10px] uppercase tracking-wider text-red-800 font-semibold block">
                30-Day Projection
              </span>
              <span className="text-xl font-bold text-[#2B0B0E] block mt-1">
                +${monthlyProfit.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#5B1B1B]">
                7 days: +${weeklyProfit.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-red-900/20">
            <p className="text-[11px] text-[#5B1B1B]">
              Formula: deposit × 2 ÷ 100. First payout after 24 hours, then every 24 hours while the
              deposit remains approved.
            </p>
            <button
              type="button"
              disabled={!calculatorValid}
              onClick={() => setDepositOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Deposit ${calculatorValid ? amount.toFixed(2) : "10.00"}
            </button>
          </div>
        </div>

        {plan && (
          <div className="max-w-xl mx-auto">
            <div className="relative rounded-2xl p-6 glass-card border-red-400/50 bg-gradient-to-b from-red-50 via-white to-rose-50">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                Active Plan
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2B0B0E]">{plan.name}</h3>
                <Wallet className="w-5 h-5 text-red-800" />
              </div>
              <div className="mb-6 pb-6 border-b border-red-900/20">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#2B0B0E]">
                    {plan.dailyPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-[#5B1B1B] font-semibold uppercase">/ daily</span>
                </div>
                <span className="text-xs text-red-800 font-medium block mt-1">
                  Paid every 24 hours after deposit approval
                </span>
              </div>
              <ul className="space-y-3 text-xs text-[#3F1414] mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-red-800 shrink-0" />
                  <span>Minimum deposit: <strong>${plan.minAmount}</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-red-800 shrink-0" />
                  <span>Maximum deposit: <strong>Unlimited</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-red-800 shrink-0" />
                  <span>First payout: <strong>After 24 hours</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-red-800 shrink-0" />
                  <span>Add more deposits at any time</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white shadow-lg shadow-red-900/20 transition active:scale-95"
              >
                Add Deposit
              </button>
            </div>
          </div>
        )}
      </main>

      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} onSuccess={loadData} />
      <WithdrawModal
        isOpen={withdrawOpen}
        currentBalance={currentBalance}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
