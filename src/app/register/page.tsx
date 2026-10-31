"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight, ShieldAlert, Users, Eye, EyeOff } from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";
import { PLATFORM_REFERRAL_CODE, displayReferralCode } from "@/lib/referral";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referredBy, setReferredBy] = useState(
    displayReferralCode(refCode || PLATFORM_REFERRAL_CODE)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!referredBy.trim()) {
      setError("A valid Sponsor / Referral Code is required to register.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referredBy: referredBy.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-3xl glass-panel p-8 shadow-2xl border border-red-900/20">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex mb-3"
          aria-label="CoreChain home"
        >
          <BrandLockup iconSize={48} priority />
        </Link>
        <h2 className="text-lg font-bold text-[#2B0B0E] tracking-tight">Create Investor Account</h2>
        <p className="text-xs text-[#5B1B1B] mt-1">
          Join via sponsor invitation to access the daily plan and partner rewards
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
            Full Legal Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#6B1D1D] absolute left-3 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Stewart"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
            />
          </div>
        </div>

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
            Create Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6B1D1D] absolute left-3 top-3" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase text-[#5B1B1B]">
              Sponsor / Referral Code <span className="text-red-800 font-bold">*</span>
            </label>
            <span className="text-[10px] text-amber-400 font-medium">Mandatory</span>
          </div>
          <div className="relative">
            <Users className="w-4 h-4 text-[#6B1D1D] absolute left-3 top-3" />
            <input
              type="text"
              required
              value={referredBy}
              onChange={(e) => setReferredBy(e.target.value)}
              placeholder="corechain"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm font-mono tracking-wider focus:outline-none focus:border-red-700"
            />
          </div>
          <p className="text-[11px] text-[#6B1D1D] mt-1">
            Invitation code:{" "}
            <span className="font-mono text-red-800">
              {displayReferralCode(PLATFORM_REFERRAL_CODE)}
            </span>{" "}
            · You can replace it with your sponsor&apos;s code.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Complete Registration"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#5B1B1B]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-red-800 hover:underline">
          Sign In here
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-red-800 text-xs">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
