"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import InvestModal from "@/components/InvestModal";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { Check, Sparkles, Shield, Clock, ChevronRight, Calculator, TrendingUp } from "lucide-react";
import { InvestmentPlan, User } from "@/lib/db";

export default function PlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculatorPlanId, setCalculatorPlanId] = useState("");
  const [calculatorAmount, setCalculatorAmount] = useState("");
  const [investAmount, setInvestAmount] = useState("");

  const loadData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setUser(authData.user);
        setCurrentBalance(authData.wallet?.currentBalance || 0);
      }

      const plansRes = await fetch("/api/investments/plans");
      const plansData = await plansRes.json();
      setPlans(plansData.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!plans.length) return;
    if (!plans.some((plan) => plan.id === calculatorPlanId)) {
      const defaultPlan = plans[1] || plans[0];
      setCalculatorPlanId(defaultPlan.id);
      setCalculatorAmount(defaultPlan.minAmount.toFixed(2));
    }
  }, [plans, calculatorPlanId]);

  const handleSelectPlan = (plan: InvestmentPlan, amount = "") => {
    setSelectedPlan(plan);
    setInvestAmount(amount);
    setInvestModalOpen(true);
  };

  const calculatorPlan = plans.find((plan) => plan.id === calculatorPlanId) || null;
  const parsedCalculatorAmount = Number.parseFloat(calculatorAmount);
  const calculatorValue = Number.isFinite(parsedCalculatorAmount) ? Math.max(0, parsedCalculatorAmount) : 0;
  const calculatorDailyProfit = calculatorPlan
    ? Math.round(((calculatorValue * calculatorPlan.dailyPercentage) / 100) * 100) / 100
    : 0;
  const calculatorTotalProfit = calculatorPlan
    ? Math.round(calculatorDailyProfit * calculatorPlan.durationDays * 100) / 100
    : 0;
  const calculatorTotalPayout = Math.round((calculatorValue + calculatorTotalProfit) * 100) / 100;
  const calculatorValid =
    !!calculatorPlan &&
    calculatorValue >= calculatorPlan.minAmount &&
    calculatorValue <= calculatorPlan.maxAmount;

  return (
    <div className="min-h-screen bg-[#080C15] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 inline-block">
            Investment Portfolio Tiers
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Institutional Capital Allocation
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Select an automated yield contract tailored to your risk profile. Compounded returns
            are calculated and credited directly to your liquid wallet every 24 hours.
          </p>
        </div>

        {/* Daily Profit Calculator */}
        <div className="glass-card rounded-2xl p-6 border-cyan-500/20">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daily Profit Calculator</h2>
              <p className="text-xs text-slate-400">
                See exactly what an investment would earn every day before locking capital.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Investment Tier
              </label>
              <select
                value={calculatorPlanId}
                onChange={(e) => {
                  const plan = plans.find((entry) => entry.id === e.target.value);
                  setCalculatorPlanId(e.target.value);
                  if (plan) setCalculatorAmount(plan.minAmount.toFixed(2));
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.dailyPercentage.toFixed(1)}% daily
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Investment Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">$</span>
                <input
                  type="number"
                  min={calculatorPlan?.minAmount}
                  max={calculatorPlan?.maxAmount}
                  step="any"
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              {calculatorPlan && (
                <p className={`mt-1.5 text-[11px] ${calculatorValid ? "text-slate-500" : "text-amber-400"}`}>
                  Allowed range: ${calculatorPlan.minAmount.toLocaleString()} – ${calculatorPlan.maxAmount.toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
                  Daily Profit
                </span>
                <span className="text-xl font-bold text-white block mt-1">
                  +${calculatorDailyProfit.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">every 24 hours</span>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-white/5 p-3">
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold block">
                  Full-Term Profit
                </span>
                <span className="text-xl font-bold text-white block mt-1">
                  +${calculatorTotalProfit.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {calculatorPlan?.durationDays || 0} days · ${calculatorTotalPayout.toFixed(2)} payout
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-white/5">
            <p className="text-[11px] text-slate-400">
              {calculatorPlan
                ? `${calculatorPlan.dailyPercentage.toFixed(1)}% daily × ${calculatorPlan.durationDays} days. Formula: investment × daily rate ÷ 100.`
                : "Loading available investment tiers..."}
            </p>
            <button
              type="button"
              disabled={!calculatorValid}
              onClick={() =>
                calculatorPlan && handleSelectPlan(calculatorPlan, calculatorValue.toFixed(2))
              }
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Calculate & Invest
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isFeatured = index === 1; // Middle tier featured
            const totalRoi = (plan.dailyPercentage * plan.durationDays).toFixed(1);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 glass-card flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/60 to-slate-950 shadow-2xl shadow-emerald-500/10"
                    : "border-white/10"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold uppercase tracking-wider shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <Sparkles
                      className={`w-5 h-5 ${isFeatured ? "text-emerald-400" : "text-cyan-400"}`}
                    />
                  </div>

                  {/* Daily Rate Display */}
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">
                        {plan.dailyPercentage.toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-400 font-semibold uppercase">
                        / Daily ROI
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium block mt-1">
                      Total Return: {totalRoi}% over term
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Min Allocation: <strong>${plan.minAmount.toLocaleString()}</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Max Allocation: <strong>${plan.maxAmount.toLocaleString()}</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        Locked Term: <strong>{plan.durationDays} Days</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Capital Return:{" "}
                        <strong className="text-emerald-400">100% Guaranteed</strong>
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 ${
                    isFeatured
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
                  }`}
                >
                  Allocate In Tier
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <InvestModal
        isOpen={investModalOpen}
        plan={selectedPlan}
        currentBalance={currentBalance}
        initialAmount={investAmount}
        onClose={() => setInvestModalOpen(false)}
        onSuccess={loadData}
      />
      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={loadData}
      />
      <WithdrawModal
        isOpen={withdrawOpen}
        currentBalance={currentBalance}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

