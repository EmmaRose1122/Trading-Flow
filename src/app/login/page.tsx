"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff, KeyRound } from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const finishLogin = (role?: string) => {
    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      if (data.requiresTwoFactor && typeof data.challengeToken === "string") {
        setChallengeToken(data.challengeToken);
        setTwoFactorCode("");
        return;
      }
      finishLogin(data.user?.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed");
      finishLogin(data.user?.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl glass-panel p-8 shadow-2xl border border-red-900/20">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex mb-3"
            aria-label="Trading Flow Capital home"
          >
            <BrandLockup iconSize={48} priority />
          </Link>
          <h2 className="text-lg font-bold text-[#2B0B0E] tracking-tight">
            {challengeToken ? "Two-factor verification" : "Access Your Portfolio"}
          </h2>
          <p className="text-xs text-[#5B1B1B] mt-1">
            {challengeToken
              ? "Enter the code from your authenticator app or a recovery code."
              : "Sign in to track balances, manage contracts & audit transactions"}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {challengeToken ? (
          <form onSubmit={handleTwoFactor} className="space-y-4">
            <div className="rounded-xl border border-red-400 bg-red-50 p-3 text-xs text-red-900/80 leading-relaxed">
              Open your authenticator app and enter the current 6-digit code. You can also enter one
              of your saved recovery codes.
            </div>
            <div>
              <label htmlFor="two-factor-code" className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
                Authentication Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#6B1D1D] absolute left-3 top-3" />
                <input
                  id="two-factor-code"
                  type="text"
                  inputMode="text"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  maxLength={20}
                  value={twoFactorCode}
                  onChange={(event) => setTwoFactorCode(event.target.value)}
                  placeholder="123456 or recovery code"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm font-mono tracking-wider focus:outline-none focus:border-red-700"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !twoFactorCode.trim()}
              className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify and sign in"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setChallengeToken("");
                setTwoFactorCode("");
                setError("");
              }}
              className="w-full py-2 text-xs font-semibold text-[#5B1B1B] hover:text-[#2B0B0E]"
            >
              Back to password sign-in
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B1D1D] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B1D1D] absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-3 text-[#6B1D1D] hover:text-[#3F1414]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In to Trading Flow"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#5B1B1B]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-red-800 hover:underline">
                Register with Referral Code
              </Link>
            </p>
          </>
        )}
        <p className="mt-3 text-center text-[11px] text-[#6B1D1D]">
          <Link href="/download" className="hover:text-red-900 transition">
            Download the Android app
          </Link>
        </p>
      </div>
    </div>
  );
}

