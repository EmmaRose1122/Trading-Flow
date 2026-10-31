"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import KycQueue from "@/components/admin/KycQueue";
import DepositAccountManager from "@/components/admin/DepositAccountManager";
import AdminWithdrawals from "@/components/admin/AdminWithdrawals";
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
  KeyRound,
  Eye,
  CalendarDays,
  TrendingUp,
  CircleDollarSign,
  Wallet,
} from "lucide-react";
import { Transaction, User, Wallet as WalletType, PayoutWallet, KycDetails } from "@/lib/db";
import { roundMoney } from "@/lib/money";
import {
  approvedDeposits,
  dailyDepositProfit,
  depositEligibleAt,
  isDepositEligible,
} from "@/lib/deposit";
import { displayReferralCode, type ReferralSummary } from "@/lib/referral";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  referralCode?: string;
  referredBy?: string | null;
  createdAt?: string;
  wallet: WalletType | null;
  twoFactorEnabled?: boolean;
  kycStatus?: string;
  kycDetails?: KycDetails | null;
  payoutWallets?: PayoutWallet[];
  referralSummary?: ReferralSummary;
}

export default function AdminPage() {
  const router = useRouter();
  const requestIdRef = useRef(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
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

  // Admin password change form
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminPasswordMsg, setAdminPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [adminPasswordLoading, setAdminPasswordLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const authRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!authRes.ok) {
        router.replace("/login");
        return;
      }
      const authData = await authRes.json();
      if (authData.user.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
      if (requestId !== requestIdRef.current) return;
      setCurrentUser(authData.user);

      const res = await fetch("/api/admin/requests", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to refresh admin data.");
      const data = await res.json();
      if (requestId !== requestIdRef.current) return;

      const nextUsers: AdminUser[] = Array.isArray(data.users) ? data.users : [];
      setPendingRequests(Array.isArray(data.pendingRequests) ? data.pendingRequests : []);
      setUsers(nextUsers);
      setAllTransactions(Array.isArray(data.allTransactions) ? data.allTransactions : []);
      const defaultPortfolioUserId =
        nextUsers.find((entry) => entry.role === "USER")?.id || nextUsers[0]?.id || "";
      setSelectedUserId((current) =>
        current && nextUsers.some((user) => user.id === current) ? current : defaultPortfolioUserId
      );
      setTargetUserId((current) =>
        current && nextUsers.some((user) => user.id === current)
          ? current
          : defaultPortfolioUserId || nextUsers[0]?.id || ""
      );
      setLoadError("");
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to refresh admin data. Please retry."
        );
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [router]);

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
        text: `Account created successfully! User: ${data.user.name} (${data.user.email}) | Referral Code: ${displayReferralCode(data.user.referralCode)} | Upline: ${data.user.referredBy ? displayReferralCode(data.user.referredBy) : "Platform direct"} | Balance: $${Number(data.user.initialBalance || 0).toFixed(2)}`,
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

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordMsg(null);
    setAdminPasswordLoading(true);

    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: adminNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update admin password");
      }
      setAdminPasswordMsg({ type: "success", text: data.message });
      setAdminNewPassword("");
    } catch (err: any) {
      setAdminPasswordMsg({ type: "error", text: err.message });
    } finally {
      setAdminPasswordLoading(false);
    }
  };

  const selectedUser = users.find((user) => user.id === selectedUserId) || null;
  const selectedTransactions = [...allTransactions]
    .filter((transaction) => transaction.userId === selectedUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const selectedDeposits = approvedDeposits(selectedTransactions, selectedUserId);
  const selectedDepositTotal = roundMoney(
    selectedDeposits.reduce((total, deposit) => total + deposit.amount, 0)
  );
  const selectedEligibleDepositTotal = roundMoney(
    selectedDeposits
      .filter((deposit) => isDepositEligible(deposit))
      .reduce((total, deposit) => total + deposit.amount, 0)
  );
  const selectedDailyProfit = dailyDepositProfit(selectedDepositTotal);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] text-red-800">
        <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-28 lg:pb-12">
      <Navbar user={currentUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="flex items-center justify-between pb-2 border-b border-red-900/20">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20 mb-1 inline-block">
              Super Admin Console
            </span>
            <h1 className="text-2xl font-bold text-[#2B0B0E] tracking-tight">System Operations & User Controls</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5B1B1B]">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-700 animate-pulse" />
              Live Admin Session
            </span>
            <button
              type="button"
              onClick={fetchAdminData}
              className="px-3 py-1.5 rounded-lg border border-red-900/20 bg-white text-[11px] font-semibold text-[#3F1414] hover:text-[#2B0B0E]"
            >
              Refresh
            </button>
          </div>
        </div>

        {loadError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {loadError}
            </span>
            <button type="button" onClick={fetchAdminData} className="font-bold underline">
              Retry
            </button>
          </div>
        )}

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Pending Requests & User Directory */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Verification Queue */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-[#2B0B0E] text-base">
                    Pending Requests Queue ({pendingRequests.length})
                  </h3>
                </div>
                <span className="text-xs text-[#5B1B1B]">Review deposits & withdrawals</span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-[#6B1D1D] text-xs border border-dashed border-red-900/20 rounded-xl">
                  No pending deposit or withdrawal requests in queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-red-900/20 text-[#5B1B1B] uppercase text-[10px] tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Method / Destination</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                      {pendingRequests.map((tx) => (
                        <tr key={tx.id} className="hover:bg-rose-50">
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.type === "DEPOSIT"
                                  ? "bg-red-100 text-red-800 border border-red-400"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-[#2B0B0E] block">{tx.userName || "User"}</span>
                            <span className="text-[10px] text-[#6B1D1D]">{tx.userEmail}</span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#2B0B0E]">
                            ${tx.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#5B1B1B] truncate max-w-xs">
                            {tx.method} {tx.txHash ? `| ${tx.txHash.slice(0, 10)}...` : ""}
                            {tx.destination ? `| ${tx.destination.slice(0, 10)}...` : ""}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={actionLoading === tx.id}
                                onClick={() => handleAction(tx.id, "APPROVE")}
                                className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1 transition"
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
                  <Users className="w-4 h-4 text-red-800" />
                  <h3 className="font-bold text-[#2B0B0E] text-base">Registered Platform Accounts ({users.length})</h3>
                </div>
                <span className="text-xs text-[#5B1B1B]">15-level referral & affiliate overview</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-red-900/20 bg-red-50 text-red-900 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-3">User & Email</th>
                      <th className="py-3 px-3">Referral Code</th>
                      <th className="py-3 px-3">Level</th>
                      <th className="py-3 px-3">Upline / Sponsor</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">KYC / 2FA</th>
                      <th className="py-3 px-3">Balance</th>
                      <th className="py-3 px-3">Ref. earned</th>
                      <th className="py-3 px-3">Deposited</th>
                      <th className="py-3 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-rose-50">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[#2B0B0E] block">{u.name}</span>
                          <span className="text-[10px] text-[#6B1D1D]">{u.email}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-red-800 whitespace-nowrap">
                          {displayReferralCode(u.referralCode) || "N/A"}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#2B0B0E] whitespace-nowrap">
                          {u.referralSummary?.level ? `Level ${u.referralSummary.level}` : "Direct"}
                        </td>
                        <td className="py-2.5 px-3">
                          {u.referredBy ? (
                            <span className="font-mono text-red-800 bg-red-100 border border-red-400 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                              {displayReferralCode(u.referredBy)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase bg-red-100 text-red-800 border border-red-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Platform Direct
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === "ADMIN"
                                ? "bg-red-700 text-white border border-red-800"
                                : "bg-white text-[#5B1B1B] border border-red-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                u.kycStatus === "APPROVED"
                                  ? "bg-red-100 text-red-800 border border-red-400"
                                  : u.kycStatus === "PENDING"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : u.kycStatus === "REJECTED"
                                      ? "bg-red-100 text-red-800 border border-red-400"
                                      : "bg-white text-red-800 border border-red-300"
                              }`}
                            >
                              {(u.kycStatus || "NOT_STARTED").replace(/_/g, " ")}
                            </span>
                            <span className={`text-[9px] font-semibold ${u.twoFactorEnabled ? "text-red-800" : "text-[#6B1D1D]"}`}>
                              2FA {u.twoFactorEnabled ? "on" : "off"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-red-800">
                          ${u.wallet?.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-red-800">
                          ${(u.referralSummary?.totalEarnings || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-red-800">
                          ${u.wallet?.totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                window.setTimeout(() => {
                                  document
                                    .getElementById("admin-user-detail")
                                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 50);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-medium border border-red-400 transition"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetUserId(u.id);
                                window.scrollTo({ top: 300, behavior: "smooth" });
                              }}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-[#3F1414] hover:text-[#2B0B0E] text-[11px] font-medium border border-red-900/20 transition"
                            >
                              Adjust
                            </button>
                          </div>
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
            <div className="glass-card rounded-2xl p-6 border border-red-400 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-red-800" />
                <h3 className="font-bold text-[#2B0B0E] text-base">Create User Account</h3>
              </div>
              <p className="text-xs text-[#5B1B1B] mb-4">
                Create user directly under the platform sponsor or a custom upline, with instant free balance credit.
              </p>

              {createMsg && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    createMsg.type === "success"
                      ? "bg-red-100 border-red-400 text-red-800"
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
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs font-mono focus:outline-none focus:border-red-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                      Account Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "USER" | "ADMIN")}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] text-xs focus:outline-none focus:border-red-700"
                    >
                      <option value="USER">USER (Investor)</option>
                      <option value="ADMIN">ADMIN (Manager)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                      Initial Free Balance ($)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={newUserInitialBalance}
                      onChange={(e) => setNewUserInitialBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                      Sponsor / Referral Code (Optional)
                    </label>
                    <span className="text-[10px] text-red-800 font-medium">Platform sponsor if empty</span>
                  </div>
                  <input
                    type="text"
                    value={newUserReferredBy}
                    onChange={(e) => setNewUserReferredBy(e.target.value)}
                    placeholder="corechain"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs font-mono tracking-wider focus:outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Credit Note / Audit Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={newUserNote}
                    onChange={(e) => setNewUserNote(e.target.value)}
                    placeholder="e.g. VIP Welcome Bonus / Promotional Deposit"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  {createLoading ? "Creating Account..." : "Create Account & Fund Balance"}
                </button>
              </form>
            </div>

            {/* Direct Balance Adjustment Form */}
            <div className="glass-card rounded-2xl p-6 border border-red-400 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-red-800" />
                <h3 className="font-bold text-[#2B0B0E] text-base">Direct Balance Adjustment</h3>
              </div>
              <p className="text-xs text-[#5B1B1B] mb-4">
                Credit or debit balances for existing accounts with full audit tracking.
              </p>

              {adjustMsg && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    adjustMsg.type === "success"
                      ? "bg-red-100 border-red-400 text-red-800"
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
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Select User Account
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] text-xs focus:outline-none focus:border-red-700"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — Balance: ${u.wallet?.currentBalance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType("CREDIT")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                        adjustType === "CREDIT"
                          ? "bg-red-100 border-red-600 text-red-800"
                          : "bg-white border-red-900/20 text-[#5B1B1B]"
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
                          : "bg-white border-red-900/20 text-[#5B1B1B]"
                      }`}
                    >
                      <MinusCircle className="w-3.5 h-3.5" /> Debit (-)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#6B1D1D] text-xs font-semibold">$</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    Audit Reason / Note
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="e.g. Promotional Deposit Bonus or Manual Correction"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-900/20 active:scale-95 disabled:opacity-50"
                >
                  {adjustLoading ? "Applying Adjustment..." : "Apply Adjustment"}
                </button>
              </form>
            </div>

            {/* Admin Security: Change Password */}
            <div className="glass-card rounded-2xl p-6 border border-amber-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-[#2B0B0E] text-base">Admin Security & Password</h3>
              </div>
              <p className="text-xs text-[#5B1B1B] mb-4">
                Update your administrator access password at any time.
              </p>

              {adminPasswordMsg && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    adminPasswordMsg.type === "success"
                      ? "bg-red-100 border-red-400 text-red-800"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {adminPasswordMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{adminPasswordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleAdminPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#5B1B1B] mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminPasswordLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  {adminPasswordLoading ? "Updating Password..." : "Update Admin Password"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <KycQueue onChanged={fetchAdminData} />
          <DepositAccountManager />
        </div>

        <AdminWithdrawals onChanged={fetchAdminData} />

        {selectedUser && (
          <section
            id="admin-user-detail"
            className="glass-card rounded-2xl p-6 scroll-mt-24 border border-red-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-red-900/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-700 to-red-800 text-white flex items-center justify-center font-extrabold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[#2B0B0E]">{selectedUser.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      selectedUser.role === "ADMIN"
                        ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                        : "bg-rose-50 text-[#3F1414]"
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B1B1B] mt-0.5">{selectedUser.email}</p>
                  <p className="text-[10px] text-[#6B1D1D] mt-1">
                    ID: <span className="font-mono">{selectedUser.id}</span>
                    {selectedUser.createdAt
                      ? ` · Joined ${new Date(selectedUser.createdAt).toLocaleDateString("en-SG")}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-400 font-semibold">
                  Referral: {displayReferralCode(selectedUser.referralCode) || "N/A"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-[#3F1414] border border-red-900/20 font-semibold">
                  Sponsor: {selectedUser.referredBy ? displayReferralCode(selectedUser.referredBy) : "Platform direct"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-400 font-semibold">
                  Level: {selectedUser.referralSummary?.level ? selectedUser.referralSummary.level : "Direct"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-400 font-semibold">
                  Referral earned: ${(selectedUser.referralSummary?.totalEarnings || 0).toFixed(2)}
                </span>
                <span className={`px-2.5 py-1 rounded-full border font-semibold ${
                  selectedUser.kycStatus === "APPROVED"
                    ? "bg-red-100 text-red-800 border-red-400"
                    : selectedUser.kycStatus === "PENDING"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      : selectedUser.kycStatus === "REJECTED"
                        ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        : "bg-rose-50 text-[#3F1414] border-red-900/20"
                }`}>
                  KYC: {(selectedUser.kycStatus || "NOT_STARTED").replace(/_/g, " ")}
                </span>
                <span className={`px-2.5 py-1 rounded-full border font-semibold ${
                  selectedUser.twoFactorEnabled
                    ? "bg-red-100 text-red-800 border-red-400"
                    : "bg-rose-50 text-[#3F1414] border-red-900/20"
                }`}>
                  2FA: {selectedUser.twoFactorEnabled ? "enabled" : "disabled"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {[
                {
                  icon: Wallet,
                  label: "Wallet balance",
                  value: `$${(selectedUser.wallet?.currentBalance || 0).toFixed(2)}`,
                  color: "text-red-800",
                },
                {
                  icon: TrendingUp,
                  label: "Total deposited",
                  value: `$${selectedDepositTotal.toFixed(2)}`,
                  color: "text-red-800",
                },
                {
                  icon: CircleDollarSign,
                  label: "Total profit",
                  value: `$${(selectedUser.wallet?.totalProfit || 0).toFixed(2)}`,
                  color: "text-red-800",
                },
                {
                  icon: CalendarDays,
                  label: "Projected daily",
                  value: `+$${selectedDailyProfit.toFixed(2)}`,
                  color: "text-red-800",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl border border-red-900/20 bg-rose-50 p-3.5">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#6B1D1D]">
                      <Icon className="w-3.5 h-3.5" />
                      {stat.label}
                    </div>
                    <p className={`mt-2 text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-[11px]">
              <div className="rounded-lg bg-rose-50 border border-red-900/20 p-3">
                <span className="text-[#6B1D1D] block">Total deposited</span>
                <span className="text-[#2B0B0E] font-semibold mt-1 block">
                  ${selectedDepositTotal.toFixed(2)}
                </span>
              </div>
              <div className="rounded-lg bg-rose-50 border border-red-900/20 p-3">
                <span className="text-[#6B1D1D] block">Total withdrawn</span>
                <span className="text-[#2B0B0E] font-semibold mt-1 block">
                  ${(selectedUser.wallet?.totalWithdrawn || 0).toFixed(2)}
                </span>
              </div>
              <div className="rounded-lg bg-rose-50 border border-red-900/20 p-3">
                <span className="text-[#6B1D1D] block">Approved deposits</span>
                <span className="text-[#2B0B0E] font-semibold mt-1 block">
                  {selectedDeposits.length}
                </span>
              </div>
              <div className="rounded-lg bg-rose-50 border border-red-900/20 p-3">
                <span className="text-[#6B1D1D] block">Eligible deposits</span>
                <span className="text-[#2B0B0E] font-semibold mt-1 block">
                  ${selectedEligibleDepositTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3 text-[11px]">
              <div className="rounded-xl border border-red-900/20 bg-rose-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#6B1D1D]">Profit payout destination</span>
                  {(() => {
                    const preferred = selectedUser.payoutWallets?.find(
                      (wallet) => wallet.isProfitDestination
                    );
                    return preferred ? (
                      <span className="rounded-full border border-red-400 bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800">
                        {preferred.label}
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-900/20 bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase text-[#5B1B1B]">
                        Not configured
                      </span>
                    );
                  })()}
                </div>
                <div className="mt-2 space-y-1.5">
                  {(selectedUser.payoutWallets || []).length === 0 ? (
                    <p className="text-[#6B1D1D]">No payout wallets saved by this user.</p>
                  ) : (
                    selectedUser.payoutWallets?.map((wallet) => (
                      <div key={wallet.id} className="flex items-center justify-between gap-2">
                        <span className="text-[#3F1414]">
                          {wallet.label} · {wallet.method}
                          {wallet.network ? ` · ${wallet.network}` : ""}
                        </span>
                        <span className="max-w-[55%] truncate font-mono text-[#6B1D1D]">
                          {wallet.address}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-red-900/20 bg-rose-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#6B1D1D]">KYC application</span>
                  <span className="font-semibold text-[#3F1414]">
                    {(selectedUser.kycStatus || "NOT_STARTED").replace(/_/g, " ")}
                  </span>
                </div>
                {selectedUser.kycDetails ? (
                  <div className="mt-2 space-y-1.5 text-[#5B1B1B]">
                    <p>Legal name: <span className="text-[#2B0B0E]">{selectedUser.kycDetails.legalName}</span></p>
                    <p>Country: <span className="text-[#2B0B0E]">{selectedUser.kycDetails.country}</span></p>
                    <p>
                      Document:{" "}
                      <span className="text-[#2B0B0E]">
                        {selectedUser.kycDetails.documentType.replace(/_/g, " ")} ·{" "}
                        {selectedUser.kycDetails.documentReference}
                      </span>
                    </p>
                    {selectedUser.kycDetails.rejectionReason && (
                      <p className="text-rose-300">
                        Rejection reason: {selectedUser.kycDetails.rejectionReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-[#6B1D1D]">No KYC application submitted.</p>
                )}
              </div>
            </div>

            {selectedUser.referralSummary && (
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3 text-[11px]">
                <div className="rounded-xl border border-red-900/20 bg-rose-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6B1D1D]">Referral position</span>
                    <span className="font-semibold text-red-800">
                      {selectedUser.referralSummary.level
                        ? `Level ${selectedUser.referralSummary.level}`
                        : "Platform direct"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[#6B1D1D]">Direct partners</span>
                    <span className="text-[#2B0B0E]">{selectedUser.referralSummary.directCount}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-[#6B1D1D]">Total network</span>
                    <span className="text-[#2B0B0E]">{selectedUser.referralSummary.networkCount}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-[#6B1D1D]">Referral earnings</span>
                    <span className="font-semibold text-red-800">
                      ${selectedUser.referralSummary.totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-3 border-t border-red-900/20 pt-2">
                    <p className="text-[#6B1D1D] mb-1.5">Upline chain</p>
                    {selectedUser.referralSummary.upline.length === 0 ? (
                      <p className="text-[#6B1D1D]">No sponsor recorded.</p>
                    ) : (
                      <ol className="space-y-1">
                        {selectedUser.referralSummary.upline.map((member) => (
                          <li key={`${member.level}-${member.id}`} className="flex justify-between gap-2">
                            <span className="text-[#6B1D1D]">L{member.level}</span>
                            <span className="truncate text-[#3F1414]">
                              {member.name}{" "}
                              <span className="font-mono text-[9px] text-red-800">
                                {displayReferralCode(member.referralCode)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-xl border border-red-900/20 bg-rose-50 p-3">
                  <p className="text-[#6B1D1D] mb-2">15-level downline summary</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead className="text-[#6B1D1D] uppercase tracking-wider">
                        <tr>
                          <th className="py-1.5 pr-2">Level</th>
                          <th className="py-1.5 pr-2">Rate</th>
                          <th className="py-1.5 pr-2">Members</th>
                          <th className="py-1.5 pr-2 text-right">Volume</th>
                          <th className="py-1.5 pr-2 text-right">Earned</th>
                          <th className="py-1.5 text-right">Top member</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                        {selectedUser.referralSummary.levels.map((level) => (
                          <tr key={level.level} className={level.count > 0 ? "bg-red-700/[0.03]" : ""}>
                            <td className="py-1.5 pr-2 font-semibold text-[#2B0B0E]">L{level.level}</td>
                            <td className="py-1.5 pr-2 text-red-800">{level.rate}%</td>
                            <td className="py-1.5 pr-2">{level.count}</td>
                            <td className="py-1.5 pr-2 text-right">${level.volume.toFixed(2)}</td>
                            <td className="py-1.5 pr-2 text-right">${level.earnings.toFixed(2)}</td>
                            <td className="py-1.5 text-right truncate max-w-[140px]">
                              {level.members[0]
                                ? `${level.members[0].name} (${displayReferralCode(level.members[0].referralCode)})`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-sm font-bold text-[#2B0B0E] mb-3">Approved deposits ({selectedDeposits.length})</h3>
                {selectedDeposits.length === 0 ? (
                  <p className="text-xs text-[#6B1D1D] rounded-xl border border-dashed border-red-900/20 p-5 text-center">
                    No approved deposits for this user.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDeposits.map((deposit) => (
                      <div key={deposit.id} className="rounded-xl border border-red-900/20 bg-rose-50 p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-[#2B0B0E]">${deposit.amount.toFixed(2)}</p>
                            <p className="text-[9px] font-mono text-[#7F1D1D] mt-0.5">{deposit.id}</p>
                            <p className="text-[10px] text-[#6B1D1D] mt-1">{deposit.method}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            isDepositEligible(deposit)
                              ? "bg-red-100 text-red-800 border border-red-400"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {isDepositEligible(deposit) ? "ELIGIBLE" : "24H WAIT"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-[10px] text-[#6B1D1D]">
                          <span>+${dailyDepositProfit(deposit.amount).toFixed(2)} / day</span>
                          <span>
                            {isDepositEligible(deposit)
                              ? "Earning now"
                              : `Starts ${depositEligibleAt(deposit).toLocaleString("en-SG")}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#2B0B0E] mb-3">
                  Recent transactions ({selectedTransactions.length})
                </h3>
                {selectedTransactions.length === 0 ? (
                  <p className="text-xs text-[#6B1D1D] rounded-xl border border-dashed border-red-900/20 p-5 text-center">
                    No transactions for this user.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-red-900/20">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-rose-50 text-[#6B1D1D] uppercase text-[9px]">
                        <tr>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                        {selectedTransactions.slice(0, 12).map((transaction) => {
                          const credit =
                            transaction.type === "BONUS"
                              ? transaction.amount >= 0
                              : ["DEPOSIT", "PROFIT", "CAPITAL_RETURN", "REFERRAL"].includes(transaction.type);
                          return (
                          <tr key={transaction.id}>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="font-semibold text-[#2B0B0E] block">{transaction.type}</span>
                              <span className="text-[9px] font-mono text-[#7F1D1D]">{transaction.id}</span>
                            </td>
                            <td className={`px-3 py-2 whitespace-nowrap ${credit ? "text-red-800" : "text-[#2B0B0E]"}`}>
                              {credit ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                transaction.status === "APPROVED" ||
                                transaction.status === "SUCCESS" ||
                                transaction.status === "COMPLETED"
                                  ? "bg-red-100 text-red-800"
                                  : transaction.status === "PENDING" ||
                                      transaction.status === "PROCESSING"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[#6B1D1D] whitespace-nowrap">
                              {new Date(transaction.createdAt).toLocaleDateString("en-SG")}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
