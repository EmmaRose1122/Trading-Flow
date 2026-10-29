"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, ShieldCheck, ShieldOff } from "lucide-react";

interface TwoFactorSettingsProps {
  enabled: boolean;
  recoveryCodeCount: number;
  onChanged: () => Promise<void> | void;
}

interface SetupState {
  secret: string;
  otpauthUri: string;
}

export default function TwoFactorSettings({
  enabled,
  recoveryCodeCount,
  onChanged,
}: TwoFactorSettingsProps) {
  const [password, setPassword] = useState("");
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const startSetup = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/user/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start 2FA setup");
      setSetup({ secret: data.secret, otpauthUri: data.otpauthUri });
      setPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to start 2FA setup",
      });
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/user/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to enable 2FA");
      setRecoveryCodes(Array.isArray(data.recoveryCodes) ? data.recoveryCodes : []);
      setMessage({ type: "success", text: "Two-factor authentication is now enabled." });
      setSetup(null);
      setCode("");
      await onChanged();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to enable 2FA",
      });
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to disable 2FA");
      setMessage({ type: "success", text: data.message || "Two-factor authentication disabled." });
      setPassword("");
      setCode("");
      setRecoveryCodes([]);
      await onChanged();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to disable 2FA",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 1800);
  };

  return (
    <section className="rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {enabled ? <ShieldCheck className="h-4 w-4 text-red-800" /> : <ShieldOff className="h-4 w-4 text-[#5B1B1B]" />}
          <div>
            <h2 className="text-base font-bold text-[#2B0B0E]">Two-factor authentication</h2>
            <p className="text-xs text-[#6B1D1D]">
              Protect sign-in with an authenticator app and single-use recovery codes.
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${
          enabled
            ? "border-red-400 bg-red-100 text-red-800"
            : "border-red-900/20 bg-white text-[#5B1B1B]"
        }`}>
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      {message && (
        <div className={`mb-4 rounded-xl border p-3 text-xs ${
          message.type === "success"
            ? "border-red-400 bg-red-100 text-red-800"
            : "border-rose-500/20 bg-rose-500/10 text-rose-400"
        }`}>
          {message.text}
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-bold text-amber-300">Save these recovery codes now</p>
          <p className="mt-1 text-[10px] text-amber-100/60">
            Each code works once. They will not be shown again.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px] text-[#2B0B0E]">
            {recoveryCodes.map((recoveryCode) => (
              <span key={recoveryCode} className="rounded bg-rose-100 px-2 py-1.5">
                {recoveryCode}
              </span>
            ))}
          </div>
        </div>
      )}

      {enabled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-red-900/20 bg-rose-50 p-3 text-xs">
            <span className="text-[#5B1B1B]">Recovery codes remaining</span>
            <span className="font-semibold text-[#2B0B0E]">{recoveryCodeCount}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Current password"
              className="rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-amber-400 focus:outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Authenticator or recovery code"
              className="rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm font-mono text-[#2B0B0E] focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={disableTwoFactor}
            disabled={loading || !password || !code}
            className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Disable two-factor authentication"}
          </button>
        </div>
      ) : setup ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-900/20 bg-rose-50 p-4">
            <p className="text-xs text-[#3F1414]">
              Add this secret to Google Authenticator, Authy or another TOTP app.
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-red-900/20 bg-rose-50 px-3 py-2.5 font-mono text-xs text-red-800">
              <span className="break-all">{setup.secret}</span>
              <button
                type="button"
                onClick={copySecret}
                className="shrink-0 text-[#5B1B1B] hover:text-red-900"
                aria-label="Copy authenticator secret"
              >
                {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <a
              href={setup.otpauthUri}
              className="mt-2 inline-block text-[10px] font-semibold text-red-800 hover:underline"
            >
              Open in authenticator app
            </a>
          </div>
          <div>
            <label htmlFor="enable-2fa-code" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
              Enter the 6-digit code
            </label>
            <input
              id="enable-2fa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm font-mono tracking-widest text-[#2B0B0E] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={enableTwoFactor}
              disabled={loading || code.length !== 6}
              className="rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Enable 2FA"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSetup(null);
                setCode("");
              }}
              className="rounded-xl border border-red-900/20 px-4 py-2.5 text-xs font-semibold text-[#5B1B1B]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label htmlFor="setup-2fa-password" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
              Confirm password to start
            </label>
            <input
              id="setup-2fa-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={startSetup}
            disabled={loading || !password}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? "Preparing..." : "Set up 2FA"}
          </button>
        </div>
      )}
    </section>
  );
}
