"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { Users, Copy, Check, Share2, Award, ChevronRight } from "lucide-react";
import { User } from "@/lib/db";

export default function ReferralsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [copied, setCopied] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setCurrentBalance(data.wallet?.currentBalance || 0);
        }
      });
  }, []);

  const referralCode = user?.referralCode || "TF89231";
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://tradingflow.com/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080C15] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 inline-block">
            Affiliate Partner Program
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Invite Partners & Earn Lifetime Yield
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Share your exclusive invitation link and earn up to 3 tiers of automated instant commissions on every funded contract.
          </p>
        </div>

        {/* Shareable Box */}
        <div className="glass-card rounded-2xl p-6 max-w-3xl mx-auto border border-emerald-500/20">
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
            Your Unique Partner Invitation Link
          </label>
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-white/10 font-mono text-xs text-slate-200">
            <span className="flex-1 truncate pl-2">{referralLink}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Link" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 text-center border-emerald-500/20">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 font-bold text-lg">
              5%
            </div>
            <h3 className="font-bold text-white text-base mb-1">Tier 1: Direct Invites</h3>
            <p className="text-xs text-slate-400">
              Direct partners who register using your referral link. Payout is credited immediately.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center border-cyan-500/20">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 font-bold text-lg">
              3%
            </div>
            <h3 className="font-bold text-white text-base mb-1">Tier 2: Sub-Affiliates</h3>
            <p className="text-xs text-slate-400">
              Users invited by your direct partners. Expanding network passive revenue.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center border-indigo-500/20">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 font-bold text-lg">
              1%
            </div>
            <h3 className="font-bold text-white text-base mb-1">Tier 3: Network Circle</h3>
            <p className="text-xs text-slate-400">
              Third-degree platform network participants. Deep lineage automated bonus.
            </p>
          </div>
        </div>
      </main>

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={() => {}}
      />
      <WithdrawModal
        isOpen={withdrawOpen}
        currentBalance={currentBalance}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

