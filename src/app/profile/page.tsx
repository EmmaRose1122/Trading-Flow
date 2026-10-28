"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import MetricCard from "@/components/MetricCard";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Copy,
  Layers,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { Investment, KycDetails, KycStatus, PayoutWallet, Transaction, Wallet as WalletType } from "@/lib/db";
import { displayReferralCode, type ReferralSummary } from "@/lib/referral";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    referralCode: string;
    referredBy: string | null;
    createdAt: string;
    twoFactorEnabled: boolean;
    recoveryCodeCount: number;
    kycStatus: KycStatus;
    kycDetails: KycDetails | null;
  };
  wallet: WalletType;
  investments: Investment[];
  investmentProfits: Array<Investment & { dailyProfit: number }>;
  dailyProfit: number;
  transactions: Transaction[];
  payoutWallets: PayoutWallet[];
  referralSummary: ReferralSummary;
  metrics: {
    activeInvestmentCount: number;
    completedInvestmentCount: number;
    transactionCount: number;
  };
}

function money(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isCredit(transaction: Transaction) {
  if (transaction.type === "BONUS") return transaction.amount >= 0;
  return ["DEPOSIT", "PROFIT", "CAPITAL_RETURN", "REFERRAL"].includes(transaction.type);
}

function statusClass(status: Transaction["status"]) {
  if (status === "APPROVED" || status === "SUCCESS") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (status === "PENDING") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
}

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoadError("");
      const response = await fetch("/api/user/profile", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Unable to load your profile.");
      setData(await response.json());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const copyReferral = async () => {
    if (!data) return;
    const link = `${window.location.origin}/register?ref=${encodeURIComponent(
      displayReferralCode(data.user.referralCode)
    )}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080C15]">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080C15] px-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm">{loadError || "Profile unavailable."}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadProfile();
            }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, wallet, investments, investmentProfits, transactions, dailyProfit, metrics, payoutWallets, referralSummary } = data;
  const profitDestination = payoutWallets.find((entry) => entry.isProfitDestination) || null;
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#080C15] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950/40 via-[#0B1422] to-cyan-950/20 p-6 sm:p-8">
          <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center text-2xl font-extrabold shadow-xl shadow-emerald-500/20 shrink-0">
                {initials || "TF"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {user.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    {user.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    user.kycStatus === "APPROVED"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : user.kycStatus === "PENDING"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : user.kycStatus === "REJECTED"
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                          : "border-white/10 bg-slate-900 text-slate-400"
                  }`}>
                    KYC {user.kycStatus.replace(/_/g, " ")}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    user.twoFactorEnabled
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-slate-900 text-slate-400"
                  }`}>
                    2FA {user.twoFactorEnabled ? "on" : "off"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                <p className="mt-2 text-[11px] text-slate-500">
                  Account ID: <span className="font-mono text-slate-400">{user.id}</span> · Member
                  since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copyReferral}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-slate-900/80 text-xs font-semibold text-slate-200 hover:border-emerald-500/30"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Referral copied" : displayReferralCode(user.referralCode)}
              </button>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100"
              >
                <Settings className="w-3.5 h-3.5" />
                Account settings
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Wallet Balance"
            value={money(wallet.currentBalance)}
            subtitle="Available liquidity"
            icon={Wallet}
            accentColor="emerald"
          />
          <MetricCard
            title="Active Investments"
            value={money(wallet.totalInvested)}
            subtitle={`${metrics.activeInvestmentCount} active contracts`}
            icon={TrendingUp}
            accentColor="cyan"
          />
          <MetricCard
            title="Total Profit"
            value={money(wallet.totalProfit)}
            change={`+${money(dailyProfit)} / day`}
            subtitle="Projected daily payout"
            icon={CircleDollarSign}
            accentColor="indigo"
          />
          <MetricCard
            title="Deposited"
            value={money(wallet.totalDeposited)}
            subtitle={`${metrics.transactionCount} ledger entries`}
            icon={CalendarDays}
            accentColor="amber"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0C1320] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Active investments</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily profit is calculated from each locked contract rate.
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-emerald-400">+{money(dailyProfit)}</span>
                <span className="text-[10px] text-slate-500 block">total per day</span>
              </div>
            </div>

            {investmentProfits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                <Layers className="w-7 h-7 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-300">No active investments yet.</p>
                <Link
                  href="/plans"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400"
                >
                  Explore investment plans <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {investmentProfits.map((investment) => {
                  const elapsed = investment.durationDays - investment.remainingDays;
                  const progress = Math.min(
                    100,
                    Math.max(0, (elapsed / investment.durationDays) * 100)
                  );
                  return (
                    <article key={investment.id} className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{investment.planName}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {money(investment.investedAmount)} invested · {investment.dailyPercentage.toFixed(1)}% daily
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-sm font-bold text-emerald-400">
                            +{money(investment.dailyProfit)} / day
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {investment.remainingDays} of {investment.durationDays} days remaining
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-white/5 bg-[#0C1320] p-5 sm:p-6 h-fit">
            <h2 className="text-base font-bold text-white">Account summary</h2>
            <dl className="mt-4 space-y-3 text-xs">
              {[
                ["Email", user.email],
                ["Referral code", displayReferralCode(user.referralCode)],
                ["Sponsor", user.referredBy ? displayReferralCode(user.referredBy) : "Platform direct"],
                ["Your level", referralSummary.level ? `Level ${referralSummary.level}` : "Platform direct"],
                ["Referral earnings", money(referralSummary.totalEarnings)],
                ["Direct partners", String(referralSummary.directCount)],
                ["Identity (KYC)", user.kycStatus.replace(/_/g, " ")],
                ["Two-factor", user.twoFactorEnabled ? "Enabled" : "Disabled"],
                ["Profit payout", profitDestination?.label || "Not configured"],
                ["Completed plans", String(metrics.completedInvestmentCount)],
                ["Withdrawn", money(wallet.totalWithdrawn)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right text-slate-200 break-all">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="py-2 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-bold"
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="py-2 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-semibold border border-white/10"
              >
                Withdraw
              </button>
            </div>
          </aside>
        </div>

        <section className="rounded-2xl border border-white/5 bg-[#0C1320] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest account ledger entries.</p>
            </div>
            <Link href="/transactions" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              Full ledger
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Amount</th>
                    <th className="py-2.5 px-2">Method</th>
                    <th className="py-2.5 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                        {new Date(transaction.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-2 font-semibold text-white whitespace-nowrap">{transaction.type}</td>
                      <td className={`py-3 px-2 font-semibold whitespace-nowrap ${isCredit(transaction) ? "text-emerald-400" : "text-slate-200"}`}>
                        {isCredit(transaction) ? "+" : "-"}
                        {money(Math.abs(transaction.amount))}
                      </td>
                      <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{transaction.method}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${statusClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} onSuccess={loadProfile} />
      <WithdrawModal
        isOpen={withdrawOpen}
        currentBalance={wallet.currentBalance}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={loadProfile}
      />
    </div>
  );
}
