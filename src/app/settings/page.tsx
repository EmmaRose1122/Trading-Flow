"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TwoFactorSettings from "@/components/account/TwoFactorSettings";
import KycSettings from "@/components/account/KycSettings";
import PayoutWallets from "@/components/account/PayoutWallets";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { KycDetails, KycStatus, PayoutWallet } from "@/lib/db";
import { displayReferralCode } from "@/lib/referral";

interface SettingsUser {
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
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [payoutWallets, setPayoutWallets] = useState<PayoutWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Unable to load account settings.");
      const data = await response.json();
      setUser(data.user);
      setPayoutWallets(Array.isArray(data.payoutWallets) ? data.payoutWallets : []);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load account settings.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save profile.");
      setUser((current) => (current ? { ...current, ...data.user } : data.user));
      setProfileMsg({ type: "success", text: "Profile details updated successfully." });
      router.refresh();
    } catch (error) {
      setProfileMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update password.");
      setPasswordMsg({ type: "success", text: data.message || "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] px-4">
        <div className="text-center">
          <p className="text-sm text-[#5B1B1B]">{loadError || "Account unavailable."}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadProfile();
            }}
            className="mt-4 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const messageBox = (message: { type: "success" | "error"; text: string } | null) =>
    message ? (
      <div
        className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-xs ${
          message.type === "success"
            ? "border-red-400 bg-red-100 text-red-800"
            : "border-rose-500/20 bg-rose-500/10 text-rose-400"
        }`}
      >
        {message.type === "success" ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <span>{message.text}</span>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-28 lg:pb-12">
      <Navbar user={user} />

      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B1B1B] hover:text-[#2B0B0E]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to profile
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#2B0B0E]">Account settings</h1>
            <p className="mt-1 text-sm text-[#5B1B1B]">
              Manage your profile, sign-in security and account preferences.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400 bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure session
          </span>
        </div>

        <section className="rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-red-800" />
            <div>
              <h2 className="text-base font-bold text-[#2B0B0E]">Profile details</h2>
              <p className="text-xs text-[#6B1D1D]">The name and email shown on your account.</p>
            </div>
          </div>
          {messageBox(profileMsg)}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-name" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                  Full name
                </label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-[#6B1D1D]" />
                  <input
                    id="settings-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-red-900/20 bg-white py-2.5 pl-9 pr-3 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="settings-email" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6B1D1D]" />
                  <input
                    id="settings-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-red-900/20 bg-white py-2.5 pl-9 pr-3 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {profileLoading ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-[#2B0B0E]">Password & security</h2>
              <p className="text-xs text-[#6B1D1D]">
                Use at least 8 characters and avoid reusing your email password.
              </p>
            </div>
          </div>
          {messageBox(passwordMsg)}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="current-password" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-400 disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {passwordLoading ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        <TwoFactorSettings
          enabled={user.twoFactorEnabled}
          recoveryCodeCount={user.recoveryCodeCount}
          onChanged={loadProfile}
        />

        <KycSettings
          status={user.kycStatus}
          details={user.kycDetails}
          onChanged={loadProfile}
        />

        <PayoutWallets wallets={payoutWallets} onChanged={loadProfile} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-2xl border border-red-900/20 bg-white p-5">
            <h2 className="text-sm font-bold text-[#2B0B0E]">Account information</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B1D1D]">Account ID</dt>
                <dd className="font-mono text-[#3F1414] break-all text-right">{user.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B1D1D]">Referral code</dt>
                <dd className="font-mono text-red-800">{displayReferralCode(user.referralCode)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B1D1D]">Account role</dt>
                <dd className="text-[#3F1414]">{user.role}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B1D1D]">Identity (KYC)</dt>
                <dd className={
                  user.kycStatus === "APPROVED"
                    ? "text-red-800"
                    : user.kycStatus === "REJECTED"
                      ? "text-rose-400"
                      : user.kycStatus === "PENDING"
                        ? "text-amber-400"
                        : "text-[#3F1414]"
                }>
                  {user.kycStatus.replace(/_/g, " ")}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B1D1D]">Two-factor</dt>
                <dd className={user.twoFactorEnabled ? "text-red-800" : "text-[#3F1414]"}>
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B1D1D]">Profit payout</dt>
                <dd className="max-w-[60%] truncate text-right text-[#3F1414]">
                  {payoutWallets.find((wallet) => wallet.isProfitDestination)?.label || "Not set"}
                </dd>
              </div>
            </dl>
          </section>
          <section className="rounded-2xl border border-red-900/20 bg-white p-5">
            <h2 className="text-sm font-bold text-[#2B0B0E]">More</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/download" data-hide-in-app className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/20 bg-white px-3 py-2 text-[11px] font-semibold text-[#3F1414] hover:text-[#2B0B0E]">
                <Download className="h-3.5 w-3.5" /> Android app
              </Link>
              <Link href="/privacy" className="rounded-lg border border-red-900/20 bg-white px-3 py-2 text-[11px] font-semibold text-[#3F1414] hover:text-[#2B0B0E]">
                Privacy policy
              </Link>
              <Link href="/contact" className="rounded-lg border border-red-900/20 bg-white px-3 py-2 text-[11px] font-semibold text-[#3F1414] hover:text-[#2B0B0E]">
                Contact support
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
