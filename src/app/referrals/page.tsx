"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import {
  Award,
  Check,
  CircleDollarSign,
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
  earnings: number;
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

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-100 text-red-800 border border-red-400 mb-3 inline-block">
            15-Level Partner Network
          </span>
          <h1 className="text-3xl font-extrabold text-[#2B0B0E] tracking-tight sm:text-4xl">
            Invite Partners & Earn Level Commissions
          </h1>
          <p className="mt-3 text-sm text-[#5B1B1B]">
            Level 1 earns 5%, Level 2 earns 3%, Level 3 earns 1%, and Levels 4–15 earn 0.5% of
            every funded contract in your network. Commissions credit automatically when a
            downline contract is activated.
          </p>
        </div>

        <section className="glass-card rounded-2xl p-6 max-w-4xl mx-auto border border-red-400">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-2">
                Your Partner Invitation Link
              </label>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-red-900/20 font-mono text-xs text-[#2B0B0E]">
                <span className="flex-1 truncate pl-2">{referralLink}</span>
                <button
                  onClick={() => copyText(referralLink, "link")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition"
                >
                  {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "link" ? "Copied" : "Copy Link"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-2">
                Your Referral Code
              </label>
              <button
                type="button"
                onClick={() => copyText(referralCode, "code")}
                className="flex items-center gap-2 rounded-xl border border-red-900/20 bg-white px-4 py-2.5 font-mono text-sm font-semibold text-red-800 hover:border-red-400"
              >
                {referralCode}
                {copied === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-red-900/20 bg-white p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#6B1D1D]">
              <Award className="w-3.5 h-3.5 text-red-800" />
              Your Level
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#2B0B0E]">
              {data.level === 0 ? "Platform Direct" : `Level ${data.level}`}
            </p>
            <p className="mt-1 text-[10px] text-[#6B1D1D]">
              {data.referredBy ? `Sponsor: ${displayReferralCode(data.referredBy)}` : "No sponsor"}
            </p>
          </div>
          <div className="rounded-2xl border border-red-900/20 bg-white p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#6B1D1D]">
              <CircleDollarSign className="w-3.5 h-3.5 text-red-800" />
              Referral Earnings
            </div>
            <p className="mt-2 text-2xl font-extrabold text-red-800">{money(data.totalEarnings)}</p>
            <p className="mt-1 text-[10px] text-[#6B1D1D]">{data.commissionCount} commission entries</p>
          </div>
          <div className="rounded-2xl border border-red-900/20 bg-white p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#6B1D1D]">
              <Users className="w-3.5 h-3.5 text-red-800" />
              Direct Partners
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#2B0B0E]">{data.directCount}</p>
            <p className="mt-1 text-[10px] text-[#6B1D1D]">Level 1 invitations</p>
          </div>
          <div className="rounded-2xl border border-red-900/20 bg-white p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#6B1D1D]">
              <Network className="w-3.5 h-3.5 text-amber-400" />
              Total Network
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#2B0B0E]">{data.networkCount}</p>
            <p className="mt-1 text-[10px] text-[#6B1D1D]">Across 15 levels</p>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-800" />
              <div>
                <h2 className="text-base font-bold text-[#2B0B0E]">15-level commission structure</h2>
                <p className="text-xs text-[#6B1D1D]">
                  Earnings shown are commissions you have received from each level.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-red-900/20 text-[10px] uppercase tracking-wider text-[#6B1D1D]">
                    <th className="py-2.5 px-2">Level</th>
                    <th className="py-2.5 px-2">Rate</th>
                    <th className="py-2.5 px-2">Partners</th>
                    <th className="py-2.5 px-2 text-right">Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                  {data.levels.map((level) => (
                    <tr key={level.level} className={level.count > 0 ? "bg-red-700/[0.03]" : ""}>
                      <td className="py-2.5 px-2 font-semibold text-[#2B0B0E]">Level {level.level}</td>
                      <td className="py-2.5 px-2 text-red-800">{level.rate}%</td>
                      <td className="py-2.5 px-2">{level.count}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-[#2B0B0E]">
                        {money(level.earnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
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
                        {new Date(commission.createdAt).toLocaleDateString("en-GB")}
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
