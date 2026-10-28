"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ShieldAlert,
  Check,
  X,
  Users,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Coins,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { Transaction, User } from "@/lib/db";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  referralCode?: string;
  referredBy?: string | null;
  wallet: {
    currentBalance: number;
    totalInvested: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Balance adjust form
  const [targetUserId, setTargetUserId] = useState("");
  const [adjustType, setAdjustType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustMsg, setAdjustMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Create User by Admin Form (Direct Upline & Free Balance)
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"USER" | "ADMIN">("USER");
  const [newUserReferredBy, setNewUserReferredBy] = useState("");
  const [newUserInitialBalance, setNewUserInitialBalance] = useState("");
  const [newUserNote, setNewUserNote] = useState("");
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      if (authData.user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      setCurrentUser(authData.user);

      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      setPendingRequests(data.pendingRequests || []);
      setUsers(data.users || []);
      if (data.users?.length > 0 && !targetUserId) {
        setTargetUserId(data.users[0].id);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router, targetUserId]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleAction = async (txId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(txId);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txId, action }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustMsg(null);
    setAdjustLoading(true);
    try {
      const res = await fetch("/api/admin/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          type: adjustType,
          amount: parseFloat(adjustAmount),
          note: adjustNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Adjustment failed");
      }
      setAdjustMsg({
        type: "success",
        text: `Balance adjusted successfully! New balance: $${data.newBalance.toFixed(2)}`,
      });
      setAdjustAmount("");
      setAdjustNote("");
      await fetchAdminData();
    } catch (err: any) {
      setAdjustMsg({ type: "error", text: err.message });
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);
    setCreateLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          referredBy: newUserReferredBy.trim() || undefined,
          initialBalance: newUserInitialBalance ? parseFloat(newUserInitialBalance) : 0,
          note: newUserNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user account");
      }

      setCreateMsg({
        type: "success",
        text: `Account created successfully! User: ${data.user.name} (${data.user.email}) | Referral Code: ${data.user.referralCode} | Upline: ${data.user.referredBy || "Direct Upline / Platform"} | Balance: $${Number(data.user.initialBalance || 0).toFixed(2)}`,
      });

      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserReferredBy("");
      setNewUserInitialBalance("");
      setNewUserNote("");
      await fetchAdminData();
    } catch (err: any) {
      setCreateMsg({ type: "error", text: err.message });
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080C15] text-emerald-400">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C15] pb-28 lg:pb-12">
      <Navbar user={currentUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20 mb-1 inline-block">
              Super Admin Console
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Operations & User Controls</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Admin Session
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Pending Requests & User Directory */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Verification Queue */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-base">
                    Pending Requests Queue ({pendingRequests.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Review deposits & withdrawals</span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-xl">
                  No pending deposit or withdrawal requests in queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Method / Destination</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {pendingRequests.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.type === "DEPOSIT"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-white block">{tx.userName || "User"}</span>
                            <span className="text-[10px] text-slate-500">{tx.userEmail}</span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            ${tx.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.method} {tx.txHash ? `| ${tx.txHash.slice(0, 10)}...` : ""}
                            {tx.destination ? `| ${tx.destination.slice(0, 10)}...` : ""}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={actionLoading === tx.id}
                                onClick={() => handleAction(tx.id, "APPROVE")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                disabled={actionLoading === tx.id}
                                onClick={() => handleAction(tx.id, "REJECT")}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Registered Platform Accounts Table */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Registered Platform Accounts ({users.length})</h3>
                </div>
                <span className="text-xs text-slate-400">Direct upline & affiliate overview</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-2.5 px-3">User & Email</th>
                      <th className="py-2.5 px-3">Referral Code</th>
                      <th className="py-2.5 px-3">Upline / Sponsor</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Balance</th>
                      <th className="py-2.5 px-3">Invested</th>
                      <th className="py-2.5 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-500">{u.email}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">
                          {u.referralCode || "N/A"}
                        </td>
                        <td className="py-2.5 px-3">
                          {u.referredBy ? (
                            <span className="font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-[11px]">
                              {u.referredBy}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              Direct Upline
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === "ADMIN"
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">
                          ${u.wallet?.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-cyan-400">
                          ${u.wallet?.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetUserId(u.id);
                              window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-white/5 transition"
                          >
                            Adjust Balance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Admin Actions */}
          <div className="space-y-8">
            {/* Create Account by Admin Form (Direct Upline + Free Balance) */}
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Create User Account</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Create user directly without referral (Direct Upline) or under a custom sponsor, with instant free balance credit.
              </p>

              {createMsg && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    createMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {createMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{createMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Account Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "USER" | "ADMIN")}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="USER">USER (Investor)</option>
                      <option value="ADMIN">ADMIN (Manager)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Initial Free Balance ($)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={newUserInitialBalance}
                      onChange={(e) => setNewUserInitialBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold uppercase text-slate-400">
                      Sponsor / Referral Code (Optional)
                    </label>
                    <span className="text-[10px] text-emerald-400 font-medium">Direct Upline if empty</span>
                  </div>
                  <input
                    type="text"
                    value={newUserReferredBy}
                    onChange={(e) => setNewUserReferredBy(e.target.value.toUpperCase())}
                    placeholder="Leave empty for Direct Upline / Platform"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-mono tracking-wider focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Credit Note / Audit Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={newUserNote}
                    onChange={(e) => setNewUserNote(e.target.value)}
                    placeholder="e.g. VIP Welcome Bonus / Promotional Deposit"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  {createLoading ? "Creating Account..." : "Create Account & Fund Balance"}
                </button>
              </form>
            </div>

            {/* Direct Balance Adjustment Form */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Direct Balance Adjustment</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Credit or debit balances for existing accounts with full audit tracking.
              </p>

              {adjustMsg && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    adjustMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {adjustMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{adjustMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleAdjustSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Select User Account
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — Balance: ${u.wallet?.currentBalance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType("CREDIT")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                        adjustType === "CREDIT"
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                          : "bg-slate-900 border-white/5 text-slate-400"
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Credit (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType("DEBIT")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                        adjustType === "DEBIT"
                          ? "bg-rose-500/15 border-rose-500 text-rose-400"
                          : "bg-slate-900 border-white/5 text-slate-400"
                      }`}
                    >
                      <MinusCircle className="w-3.5 h-3.5" /> Debit (-)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 text-xs font-semibold">$</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Audit Reason / Note
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="e.g. Promotional Deposit Bonus or Manual Correction"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {adjustLoading ? "Applying Adjustment..." : "Apply Adjustment"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
