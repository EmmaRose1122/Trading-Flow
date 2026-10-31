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
import { Transaction, Wallet as WalletType, User } from "@/lib/db";
import { displayReferralCode } from "@/lib/referral";
import { isWithdrawalSettled } from "@/lib/bep20";

type DepositPosition = {
  id: string;
  amount: number;
  method: string;
  txHash: string | null;
  createdAt: string;
  approvedAt: string;
  eligibleAt: string;
  isEligible: boolean;
  dailyProfit: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<DepositPosition[]>([]);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [eligibleDailyProfit, setEligibleDailyProfit] = useState(0);
  const [eligibleDepositTotal, setEligibleDepositTotal] = useState(0);
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
        setDeposits(overview.deposits || []);
        setDailyProfit(overview.dailyProfit || 0);
        setTotalDeposited(overview.totalDeposited || 0);
        setEligibleDailyProfit(overview.eligibleDailyProfit || 0);
        setEligibleDepositTotal(overview.eligibleDepositTotal || 0);
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] text-red-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#5B1B1B]">
            Loading CoreChain...
          </span>
        </div>
      </div>
    );
  }

  const currentBal = wallet?.currentBalance || 0;
  const totalProf = wallet?.totalProfit || 0;
  const earnedRoi = totalDeposited ? (totalProf / totalDeposited) * 100 : 0;
  const pendingWith = transactions
    .filter(
      (t) =>
        t.type === "WITHDRAWAL" && (t.status === "PENDING" || t.status === "PROCESSING")
    )
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-red-900/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#2B0B0E] tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-400">
                <ShieldCheck className="w-3 h-3" /> Daily Plan Active
              </span>
            </div>
            <p className="text-xs text-[#5B1B1B]">
              Account ID: #{user?.id} | Referral Code:{" "}
              <strong className="text-red-800 font-mono">{displayReferralCode(user?.referralCode)}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setDepositOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-red-900/20 active:scale-95"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Deposit Capital
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-[#2B0B0E] font-semibold text-xs border border-red-900/20 transition active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw Funds
            </button>
            <Link
              href="/plans"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-800 hover:bg-red-200 font-semibold text-xs border border-red-400 transition active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              Explore Plans
            </Link>
            <Link
              href="/download"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#2B0B0E] hover:bg-rose-50 font-semibold text-xs border border-red-900/20 transition active:scale-95"
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
            title="Total Deposited"
            value={`$${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change={dailyProfit > 0 ? `+$${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} / day` : undefined}
            subtitle={`${deposits.length} approved deposit${deposits.length === 1 ? "" : "s"}`}
            icon={TrendingUp}
            accentColor="cyan"
          />
          <MetricCard
            title="Daily 2% Profit"
            value={`$${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change={`Eligible now: $${eligibleDailyProfit.toFixed(2)}`}
            subtitle={`$${eligibleDepositTotal.toFixed(2)} currently eligible`}
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

        {/* Deposit-based daily profit */}
        <div className="glass-card rounded-2xl p-6 border-red-400">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-400 text-red-800 flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#2B0B0E] text-base">Your Daily 2% Profit</h3>
                <p className="text-xs text-[#5B1B1B]">
                  Calculated from your approved deposits after each deposit completes its 24-hour
                  waiting period.
                </p>
              </div>
            </div>
            <div className="md:text-right">
              <span className="text-3xl font-extrabold text-red-800">
                +${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-[#5B1B1B]"> / day</span>
              <p className="text-[11px] text-[#6B1D1D] mt-0.5">
                ${eligibleDailyProfit.toFixed(2)} eligible right now
              </p>
            </div>
          </div>

          {deposits.length === 0 ? (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-dashed border-red-900/20 bg-rose-50 p-4">
              <p className="text-xs text-[#5B1B1B]">
                No approved deposits yet. Deposit at least $10 to activate 2% daily profit.
              </p>
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="text-xs font-bold text-red-800 hover:text-red-900 whitespace-nowrap"
              >
                Add deposit →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="rounded-xl bg-rose-50 border border-red-900/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#2B0B0E]">
                        ${deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-[#5B1B1B] mt-0.5">{deposit.method}</p>
                    </div>
                    <span className="text-sm font-bold text-red-800 whitespace-nowrap">
                      +${deposit.dailyProfit.toFixed(2)} / day
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-900/20 text-[10px] text-[#6B1D1D]">
                    <span>
                      {deposit.isEligible
                        ? "Earning 2% daily"
                        : `Starts ${new Date(deposit.eligibleAt).toLocaleString("en-SG")}`}
                    </span>
                    <span>{new Date(deposit.approvedAt).toLocaleDateString("en-SG")}</span>
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

          {/* Quick plan banner */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-red-400">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-100 rounded-full blur-3xl pointer-events-none" />
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-400 mb-3 inline-block">
                One Daily Plan
              </span>
              <h3 className="text-xl font-bold text-[#2B0B0E] mb-2">
                Daily 2% Plan
              </h3>
              <p className="text-xs text-[#3F1414] leading-relaxed mb-4">
                Deposit from $10 with no maximum. Each approved deposit starts earning 2% every 24
                hours after its 24-hour waiting period. Add more at any time.
              </p>

              <div className="space-y-2 text-xs text-[#5B1B1B] mb-6 bg-rose-50 p-3.5 rounded-xl border border-red-900/20">
                <div className="flex justify-between">
                  <span>Minimum deposit:</span>
                  <strong className="text-[#2B0B0E]">$10.00</strong>
                </div>
                <div className="flex justify-between">
                  <span>Maximum deposit:</span>
                  <strong className="text-red-800">Unlimited</strong>
                </div>
                <div className="flex justify-between">
                  <span>Daily payout:</span>
                  <strong className="text-red-800">+$0.20 / $10</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDepositOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-900 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-red-900/20"
            >
              Add Deposit
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Transactions Table with Live Search & Filter */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-[#2B0B0E] text-base">Transactions Activity Ledger</h3>
              <p className="text-xs text-[#5B1B1B]">
                Audited transaction records with instant multi-parameter search
              </p>
            </div>

            {/* Live Search and Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5B1B1B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search TxID, amount, status..."
                  className="pl-9 pr-4 py-1.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700 w-52 sm:w-64"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-red-900/20">
                <Filter className="w-3.5 h-3.5 text-[#6B1D1D] ml-1.5 mr-1" />
                {["ALL", "PROFIT", "DEPOSIT", "WITHDRAWAL", "INVESTMENT"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      selectedType === t
                        ? "bg-red-700 text-white shadow-sm"
                        : "text-[#5B1B1B] hover:text-[#2B0B0E]"
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
                <tr className="border-b border-red-900/20 text-[#5B1B1B] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">TxID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6B1D1D]">
                      No matching transaction entries found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.slice(0, 8).map((tx) => {
                    const isPositive =
                      tx.type === "DEPOSIT" ||
                      tx.type === "PROFIT" ||
                      tx.type === "CAPITAL_RETURN" ||
                      tx.type === "REFERRAL" ||
                      (tx.type === "BONUS" && tx.amount >= 0);
                    return (
                      <tr key={tx.id} className="hover:bg-rose-50 transition-colors">
                        <td className="py-3 px-3 text-[#5B1B1B] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()} {" "}
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#3F1414] whitespace-nowrap">
                          {tx.id}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.type === "PROFIT"
                                ? "bg-red-100 text-red-800 border border-red-400"
                                : tx.type === "DEPOSIT"
                                ? "bg-red-100 text-red-800 border border-red-400"
                                : tx.type === "WITHDRAWAL"
                                ? "bg-amber-100 text-amber-800 border border-amber-400"
                                : "bg-red-100 text-red-800 border border-red-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold whitespace-nowrap">
                          <span className={isPositive ? "text-red-800" : "text-[#2B0B0E]"}>
                            {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#5B1B1B] whitespace-nowrap">
                          {tx.method}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              isWithdrawalSettled(tx.status)
                                ? "bg-red-100 text-red-800 border border-red-400"
                                : tx.status === "PENDING" || tx.status === "PROCESSING"
                                ? "bg-amber-100 text-amber-800 border border-amber-400"
                                : "bg-rose-100 text-rose-800 border border-rose-400"
                            }`}
                          >
                            {isWithdrawalSettled(tx.status) ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : tx.status === "PENDING" || tx.status === "PROCESSING" ? (
                              <Clock className="w-3 h-3" />
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

