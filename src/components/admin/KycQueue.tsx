"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  Clock,
  RefreshCw,
  ShieldX,
  X,
} from "lucide-react";
import type { KycDetails } from "@/lib/db";

interface KycApplication {
  id: string;
  name: string;
  email: string;
  kycStatus: string;
  kycDetails: KycDetails | null;
}

interface KycQueueProps {
  onChanged?: () => Promise<void> | void;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
}

export default function KycQueue({ onChanged }: KycQueueProps) {
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/kyc", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load KYC applications");
      setApplications(Array.isArray(data.pendingKyc) ? data.pendingKyc : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load KYC applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (userId: string, action: "APPROVE" | "REJECT") => {
    setBusyId(userId);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason: reasons[userId] || "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to review application");
      setMessage(
        action === "APPROVE"
          ? "KYC application approved. Withdrawals are now unlocked for this user."
          : "KYC application rejected. The user can resubmit with corrected details."
      );
      setReasons((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
      await load();
      if (onChanged) await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to review application");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="glass-card rounded-2xl p-6 border border-cyan-500/15">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="font-bold text-white text-base">
              KYC Review Queue ({applications.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Approve identity checks to unlock withdrawals.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {message && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <BadgeCheck className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 p-5 text-xs text-slate-400">
          <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">
          No pending KYC applications.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const details = application.kycDetails;
            return (
              <article key={application.id} className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{details?.legalName || application.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {application.email} · submitted {formatDate(details?.submittedAt)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-400">
                    Pending review
                  </span>
                </div>

                {details && (
                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                    <div>
                      <dt className="text-slate-500">Date of birth</dt>
                      <dd className="text-slate-200">{formatDate(details.dateOfBirth)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Country</dt>
                      <dd className="text-slate-200">{details.country}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Residential address</dt>
                      <dd className="text-slate-200">{details.address}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Document type</dt>
                      <dd className="text-slate-200">{details.documentType.replace(/_/g, " ")}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Document number</dt>
                      <dd className="font-mono text-slate-200">{details.documentReference}</dd>
                    </div>
                  </dl>
                )}

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={reasons[application.id] || ""}
                    onChange={(event) =>
                      setReasons((current) => ({ ...current, [application.id]: event.target.value }))
                    }
                    placeholder="Rejection reason (optional)"
                    maxLength={200}
                    className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-[11px] text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === application.id}
                      onClick={() => review(application.id, "APPROVE")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-[11px] font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === application.id}
                      onClick={() => review(application.id, "REJECT")}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      {busyId === application.id ? <X className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
