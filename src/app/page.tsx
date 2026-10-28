"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  CircleDollarSign,
  Clock,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Download,
} from "lucide-react";
import { Investment, Transaction, Wallet as WalletType, User } from "@/lib/db";

type InvestmentProfit = Investment & { dailyProfit: number };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investmentProfits, setInvestmentProfits] = useState<InvestmentProfit[]>([]);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setWallet(data.wallet);

      const [txRes, overviewRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/wallet/overview"),
      ]);
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);

      if (overviewRes.ok) {
        const overview = await overviewRes.json();
        setInvestmentProfits(overview.investmentProfits || []);
        setDailyProfit(overview.dailyProfit || 0);
        if (overview.wallet) setWallet(overview.wallet);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const filteredTransactions = transactions.filter((tx) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      tx.id.toLowerCase().includes(query) ||
      tx.type.toLowerCase().includes(query) ||
      tx.status.toLowerCase().includes(query) ||
      tx.method.toLowerCase().includes(query) ||
      tx.amount.toFixed(2).includes(query) ||
      (tx.txHash && tx.txHash.toLowerCase().includes(query)) ||
      (tx.note && tx.note.toLowerCase().includes(query));

    const matchesType = selectedType === "ALL" || tx.type === selectedType;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080C15] text-emerald-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Loading Trading Flow...
          </span>
        </div>
      </div>
    );
  }

  const currentBal = wallet?.currentBalance || 0;
  const totalInv = wallet?.totalInvested || 0;
  const totalProf = wallet?.totalProfit || 0;
  const earnedRoi = wallet?.totalDeposited ? (totalProf / wallet.totalDeposited) * 100 : 0;
  const pendingWith = transactions
    .filter((t) => t.type === "WITHDRAWAL" && t.status === "PENDING")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#080C15] pb-16">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Tier 1 Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Account ID: #{user?.id} | Referral Code:{" "}
              <strong className="text-emerald-400 font-mono">{user?.referralCode}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setDepositOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Deposit Capital
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-white/10 transition active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw Funds
            </button>
            <Link
              href="/plans"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-xs border border-cyan-500/20 transition active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              Explore Plans
            </Link>
            <Link
              href="/download"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-slate-200 hover:bg-slate-800 font-semibold text-xs border border-white/10 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Get App
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Wallet Balance"
            value={`$${currentBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change={`${earnedRoi.toFixed(1)}% earned`}
            subtitle="Available liquidity"
            icon={Wallet}
            accentColor="emerald"
          />
          <MetricCard
            title="Active Investments"
            value={`$${totalInv.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change={dailyProfit > 0 ? `+$${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} / day` : undefined}
            subtitle={`${investmentProfits.length} active contract${investmentProfits.length === 1 ? "" : "s"}`}
            icon={TrendingUp}
            accentColor="cyan"
          />
          <MetricCard
            title="Total Earned ROI"
            value={`$${totalProf.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change="Auto Credited"
            subtitle="Daily compounded profits"
            icon={CircleDollarSign}
            accentColor="indigo"
          />
          <MetricCard
            title="Pending Withdrawals"
            value={`$${pendingWith.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtitle={pendingWith > 0 ? "Under network verification" : "Zero pending queues"}
            icon={Clock}
            accentColor="amber"
          />
        </div>

        {/* Per-contract daily profit */}
        <div className="glass-card rounded-2xl p-6 border-emerald-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Your Daily Profit</h3>
                <p className="text-xs text-slate-400">
                  Calculated from each active contract&apos;s investment amount and locked daily rate.
                </p>
              </div>
            </div>
            <div className="md:text-right">
              <span className="text-3xl font-extrabold text-emerald-400">
                +${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-slate-400"> / day</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {investmentProfits.length} active investment{investmentProfits.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {investmentProfits.length === 0 ? (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">
                No active investments yet. Allocate capital to activate daily earnings.
              </p>
              <Link
                href="/plans"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
              >
                Explore plans →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
              {investmentProfits.map((investment) => (
                <div
                  key={investment.id}
                  className="rounded-xl bg-slate-900/60 border border-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{investment.planName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ${investment.investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                        at {investment.dailyPercentage.toFixed(1)}% daily
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                      +${investment.dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-500">
                    <span>{investment.remainingDays} days remaining</span>
                    <span>{investment.durationDays}-day term</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle Section: Chart + Quick Access Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart transactions={transactions} currentBalance={currentBal} />
          </div>

          {/* Quick Plan Banner */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-emerald-500/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-3 inline-block">
                Hot Opportunity
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Premium Growth Tier (2.0% / Day)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Automated high-frequency arbitrage yield contract. 30-day locked term with full
                principal release upon maturity.
              </p>

              <div className="space-y-2 text-xs text-slate-400 mb-6 bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span>Minimum Allocation:</span>
                  <strong className="text-white">$1,000.00</strong>
                </div>
                <div className="flex justify-between">
                  <span>Average Daily Payout:</span>
                  <strong className="text-emerald-400">+$20.00 / $1k</strong>
                </div>
                <div className="flex justify-between">
                  <span>Capital Protection:</span>
                  <strong className="text-cyan-400">100% Back</strong>
                </div>
              </div>
            </div>

            <Link
              href="/plans"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-500/20"
            >
              Subscribe To Plan
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Transactions Table with Live Search & Filter */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-white text-base">Transactions Activity Ledger</h3>
              <p className="text-xs text-slate-400">
                Audited transaction records with instant multi-parameter search
              </p>
            </div>

            {/* Live Search and Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search TxID, amount, status..."
                  className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 w-52 sm:w-64"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/5">
                <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
                {["ALL", "PROFIT", "DEPOSIT", "WITHDRAWAL", "INVESTMENT"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      selectedType === t
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">TxID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching transaction entries found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.slice(0, 8).map((tx) => {
                    const isPositive =
                      tx.type === "DEPOSIT" ||
                      tx.type === "PROFIT" ||
                      tx.type === "CAPITAL_RETURN" ||
                      (tx.type === "BONUS" && tx.amount >= 0);
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()} {" "}
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                          {tx.id}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.type === "PROFIT"
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : tx.type === "DEPOSIT"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : tx.type === "WITHDRAWAL"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold whitespace-nowrap">
                          <span className={isPositive ? "text-emerald-400" : "text-slate-200"}>
                            {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {tx.method}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              tx.status === "APPROVED" || tx.status === "SUCCESS"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : tx.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {tx.status === "APPROVED" || tx.status === "SUCCESS" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={fetchUserData}
      />
      <WithdrawModal
        isOpen={withdrawOpen}
        currentBalance={currentBal}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={fetchUserData}
      />
    </div>
  );
}

