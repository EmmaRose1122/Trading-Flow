"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import {
  Calculator,
  Check,
  Copy,
  Layers,
  Network,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import type { User } from "@/lib/db";
import { displayReferralCode } from "@/lib/referral";

interface ReferralMember {
  id: string;
  name: string;
  referralCode: string;
}

interface ReferralLevel {
  level: number;
  rate: number;
  count: number;
  volume: number;
  earnings: number;
  commissionCount: number;
  members: ReferralMember[];
}

interface ReferralCommission {
  id: string;
  amount: number;
  level: number;
  sourceUserName: string;
  note: string;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  level: number;
  referredBy: string | null;
  directCount: number;
  networkCount: number;
  networkVolume: number;
  activeLevels: number;
  deepestLevel: number;
  totalRate: number;
  totalEarnings: number;
  commissionCount: number;
  upline: Array<{ level: number; id: string; name: string; referralCode: string }>;
  levels: ReferralLevel[];
  commissions: ReferralCommission[];
}

function money(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<ReferralData | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [avgDeposit, setAvgDeposit] = useState("1000");
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoadError("");
      const [authRes, referralRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/user/referrals", { cache: "no-store" }),
      ]);
      if (authRes.status === 401 || referralRes.status === 401) {
        router.replace("/login");
        return;
      }
      if (!authRes.ok || !referralRes.ok) {
        throw new Error("Unable to load your referral network.");
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setCurrentBalance(authData.wallet?.currentBalance || 0);
      setData(await referralRes.json());
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load your referral network."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyText = async (value: string, kind: "link" | "code") => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] px-4">
        <div className="text-center">
          <p className="text-sm text-[#5B1B1B]">{loadError || "Referral data unavailable."}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="mt-4 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const referralCode = displayReferralCode(data.referralCode);
  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`
      : `/register?ref=${encodeURIComponent(referralCode)}`;
  const directMembers = data.levels[0]?.members || [];
  const averageDeposit = Math.max(0, Number.parseFloat(avgDeposit) || 0);
  const fullLevelPayout = Math.round(averageDeposit * data.totalRate) / 100;
  const currentNetworkPotential =
    Math.round(
      data.levels.reduce(
        (total, level) => total + level.count * averageDeposit * (level.rate / 100),
        0
      ) * 100
    ) / 100;
  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-yellow-400/25 bg-[#0B0B0C] p-5 text-white shadow-2xl shadow-red-950/20 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-700/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-300">
                <Network className="h-3 w-3" />
                15-Level Partner Network
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                15 levels. One clear income view.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-300">
                Earn 5% from Level 1, 3% from Level 2, 1% from Level 3 and 0.5% from Levels 4–15
                on every approved downline deposit. Combined maximum:{" "}
                <strong className="text-yellow-300">{data.totalRate.toFixed(1)}%</strong> per
                approved deposit.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-neutral-300">
                  One-time commission
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-neutral-300">
                  Credited to wallet
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-neutral-300">
                  Not a daily return
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  <span>Network depth</span>
                  <span className="text-yellow-300">
                    {data.activeLevels}/15 active · deepest L{data.deepestLevel || 0}
                  </span>
                </div>
                <div className="mt-2 flex gap-1">
                  {data.levels.map((level) => (
                    <span
                      key={level.level}
                      title={`Level ${level.level}: ${level.count} member(s)`}
                      className={`h-2 flex-1 rounded-full ${
                        level.count > 0
                          ? level.level <= 3
                            ? "bg-yellow-400"
                            : "bg-red-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-neutral-500">
                  Your upline:{" "}
                  {data.level === 0 ? "Platform Direct" : `Level ${data.level}`}
                  {data.referredBy
                    ? ` · Sponsor ${displayReferralCode(data.referredBy)}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-yellow-400/20 bg-black/25 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    Commission earned
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-yellow-300">
                    {money(data.totalEarnings)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-neutral-500">
                    {data.commissionCount} entries
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    Network volume
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-white">
                    {money(data.networkVolume)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-neutral-500">Approved deposits</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    Direct partners
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-white">{data.directCount}</p>
                  <p className="mt-0.5 text-[9px] text-neutral-500">Level 1</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    Total network
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-white">{data.networkCount}</p>
                  <p className="mt-0.5 text-[9px] text-neutral-500">Across 15 levels</p>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  Your invitation link
                </label>
                <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 p-1">
                  <span className="min-w-0 flex-1 truncate px-2 font-mono text-[10px] text-neutral-300">
                    {referralLink}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(referralLink, "link")}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-yellow-400 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-black hover:bg-yellow-300"
                  >
                    {copied === "link" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied === "link" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyText(referralCode, "code")}
                className="mt-2 flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-[10px] text-neutral-300 hover:border-yellow-400/30"
              >
                <span className="font-bold uppercase tracking-wider text-neutral-500">Code</span>
                <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-yellow-300">
                  {referralCode}
                  {copied === "code" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.35fr] lg:items-end">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-red-800" />
                <h2 className="text-base font-bold text-[#2B0B0E]">Level income planner</h2>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#6B1D1D]">
                Estimate the one-time commission from approved downline deposits. This is not a
                daily ROI and does not guarantee any payment.
              </p>
              <label
                htmlFor="avg-deposit"
                className="mt-4 block text-[10px] font-semibold uppercase tracking-wider text-[#6B1D1D]"
              >
                Average approved deposit per partner (USD)
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <input
                  id="avg-deposit"
                  type="number"
                  min={0}
                  step="50"
                  value={avgDeposit}
                  onChange={(event) => setAvgDeposit(event.target.value)}
                  className="w-36 rounded-xl border border-red-900/20 bg-white px-3 py-2 text-sm font-semibold text-[#2B0B0E] focus:border-red-700 focus:outline-none"
                />
                {[100, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAvgDeposit(String(preset))}
                    className={`rounded-lg border px-2.5 py-2 text-[10px] font-bold transition ${
                      Number(avgDeposit) === preset
                        ? "border-red-700 bg-red-700 text-white"
                        : "border-red-900/20 bg-white text-[#5B1B1B] hover:border-red-400"
                    }`}
                  >
                    ${preset.toLocaleString("en-SG")}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                  Full 15-level payout
                </p>
                <p className="mt-1 text-xl font-extrabold text-red-800">{money(fullLevelPayout)}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#6B1D1D]">
                  One approved deposit at every level · {data.totalRate.toFixed(1)}% combined
                </p>
              </div>
              <div className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                  Your current network
                </p>
                <p className="mt-1 text-xl font-extrabold text-[#2B0B0E]">
                  {money(currentNetworkPotential)}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#6B1D1D]">
                  Based on {data.networkCount} members and one approved deposit each
                </p>
              </div>
              <div className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                  Approved volume
                </p>
                <p className="mt-1 text-xl font-extrabold text-[#2B0B0E]">{money(data.networkVolume)}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#6B1D1D]">
                  Only approved downline deposits generate commission
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-900">
            Example: a $1,000 approved deposit by a partner at each of the 15 levels produces
            $150 in combined level commission (5% + 3% + 1% + twelve 0.5% amounts). Commission is
            credited once per approved deposit, not every day. No commission is paid on your own
            deposit.
          </p>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-800" />
              <div>
                <h2 className="text-base font-bold text-[#2B0B0E]">15-level commission structure</h2>
                <p className="text-xs text-[#6B1D1D]">
                  Volume is approved downline deposits; earnings are commissions already credited
                  to your wallet.
                </p>
              </div>
            </div>
            <div className="space-y-2 md:hidden">
              {data.levels.map((level) => (
                <div
                  key={level.level}
                  className={`rounded-xl border p-3 ${
                    level.count > 0 ? "border-red-400 bg-red-50/60" : "border-red-900/15 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-[#2B0B0E]">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                          level.count > 0
                            ? "bg-red-700 text-white"
                            : "bg-rose-100 text-[#6B1D1D]"
                        }`}
                      >
                        {level.level}
                      </span>
                      Level {level.level}
                    </span>
                    <span className="rounded-full border border-red-400 bg-white px-2 py-0.5 text-[10px] font-bold text-red-800">
                      {level.rate}%
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <p className="text-[#6B1D1D]">Members</p>
                      <p className="mt-0.5 font-bold text-[#2B0B0E]">{level.count}</p>
                    </div>
                    <div>
                      <p className="text-[#6B1D1D]">Volume</p>
                      <p className="mt-0.5 font-bold text-[#2B0B0E]">{money(level.volume)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#6B1D1D]">Earned</p>
                      <p className="mt-0.5 font-bold text-red-800">{money(level.earnings)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="border-b border-red-900/20 text-[10px] uppercase tracking-wider text-[#6B1D1D]">
                    <th className="py-2.5 px-2">Level</th>
                    <th className="py-2.5 px-2">Rate</th>
                    <th className="py-2.5 px-2">Members</th>
                    <th className="py-2.5 px-2 text-right">Volume</th>
                    <th className="py-2.5 px-2 text-right">Earned</th>
                    <th className="py-2.5 px-2 text-right">Entries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                  {data.levels.map((level) => (
                    <tr key={level.level} className={level.count > 0 ? "bg-red-700/[0.03]" : ""}>
                      <td className="py-2.5 px-2 font-semibold text-[#2B0B0E]">Level {level.level}</td>
                      <td className="py-2.5 px-2">
                        <span className="font-semibold text-red-800">{level.rate}%</span>
                        <span className="mt-1 block h-1 w-14 overflow-hidden rounded-full bg-rose-100">
                          <span
                            className="block h-full rounded-full bg-red-700"
                            style={{ width: `${Math.min(100, (level.rate / 5) * 100)}%` }}
                          />
                        </span>
                      </td>
                      <td className="py-2.5 px-2">{level.count}</td>
                      <td className="py-2.5 px-2 text-right">{money(level.volume)}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-red-800">
                        {money(level.earnings)}
                      </td>
                      <td className="py-2.5 px-2 text-right">{level.commissionCount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-red-900/20 bg-rose-50 font-bold text-[#2B0B0E]">
                    <td className="py-2.5 px-2">Total</td>
                    <td className="py-2.5 px-2 text-red-800">{data.totalRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-2">{data.networkCount}</td>
                    <td className="py-2.5 px-2 text-right">{money(data.networkVolume)}</td>
                    <td className="py-2.5 px-2 text-right text-red-800">{money(data.totalEarnings)}</td>
                    <td className="py-2.5 px-2 text-right">{data.commissionCount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-red-900/20 bg-gradient-to-br from-[#2B0B0E] to-[#5B1B1B] p-5 text-white">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-300" />
                <h2 className="text-sm font-bold">How level income works</h2>
              </div>
              <p className="text-[11px] leading-relaxed text-white/75">
                Commission is calculated on an approved downline deposit and credited once to your
                wallet. It is not a daily payout and does not depend on your own deposit.
              </p>
              <div className="mt-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Level 1 · 5%</span>
                  <span className="font-semibold text-yellow-300">$50 on $1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Level 2 · 3%</span>
                  <span className="font-semibold text-yellow-300">$30 on $1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Level 3 · 1%</span>
                  <span className="font-semibold text-yellow-300">$10 on $1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Levels 4–15 · 0.5% each</span>
                  <span className="font-semibold text-yellow-300">$60 on $1,000</span>
                </div>
              </div>
              <p className="mt-3 border-t border-white/15 pt-3 text-[10px] leading-relaxed text-white/65">
                Maximum combined level rate: {data.totalRate.toFixed(1)}%. Every commission requires
                an approved deposit in the corresponding downline level.
              </p>
            </section>

            <section className="rounded-2xl border border-red-900/20 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-800" />
                <h2 className="text-sm font-bold text-[#2B0B0E]">Your upline</h2>
              </div>
              {data.upline.length === 0 ? (
                <p className="text-xs text-[#6B1D1D]">
                  You are registered directly under the platform. No upline recorded.
                </p>
              ) : (
                <ol className="space-y-2.5">
                  {data.upline.map((member) => (
                    <li key={member.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[#5B1B1B]">Level {member.level}</span>
                      <span className="text-right text-[#2B0B0E]">
                        {member.name}
                        <span className="ml-2 font-mono text-[10px] text-red-800">
                          {displayReferralCode(member.referralCode)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="rounded-2xl border border-red-900/20 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-red-800" />
                <h2 className="text-sm font-bold text-[#2B0B0E]">Recent commissions</h2>
              </div>
              {data.commissions.length === 0 ? (
                <p className="text-xs text-[#6B1D1D]">
                  No commissions yet. Invite partners and earn when they activate a plan.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {data.commissions.slice(0, 6).map((commission) => (
                    <li key={commission.id} className="rounded-xl border border-red-900/20 bg-rose-50 p-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#2B0B0E]">{commission.sourceUserName}</span>
                        <span className="font-bold text-red-800">+{money(commission.amount)}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-[#6B1D1D]">
                        Level {commission.level} ·{" "}
                        {new Date(commission.createdAt).toLocaleDateString("en-SG")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>

        <section className="rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-red-800" />
            <div>
              <h2 className="text-base font-bold text-[#2B0B0E]">Direct partners</h2>
              <p className="text-xs text-[#6B1D1D]">Level 1 members who joined with your code.</p>
            </div>
          </div>
          {directMembers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-red-900/20 p-6 text-center text-xs text-[#6B1D1D]">
              No direct partners yet. Share your invitation link to start building your network.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {directMembers.map((member) => (
                <div key={member.id} className="rounded-xl border border-red-900/20 bg-rose-50 p-3.5">
                  <p className="text-sm font-semibold text-[#2B0B0E]">{member.name}</p>
                  <p className="mt-1 font-mono text-[10px] text-red-800">
                    {displayReferralCode(member.referralCode)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
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
