"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Clock,
  FileCheck2,
  Send,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import type { KycDetails, KycStatus } from "@/lib/db";

interface KycSettingsProps {
  status: KycStatus;
  details: KycDetails | null;
  onChanged: () => Promise<void> | void;
}

const DOCUMENT_TYPES = [
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENCE", label: "Driving licence" },
  { value: "NATIONAL_ID", label: "National ID card" },
];

const STATUS_META: Record<
  KycStatus,
  { label: string; className: string; icon: typeof BadgeCheck }
> = {
  NOT_STARTED: {
    label: "Not started",
    className: "border-red-900/20 bg-white text-[#5B1B1B]",
    icon: ShieldAlert,
  },
  PENDING: {
    label: "Under review",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className: "border-red-400 bg-red-100 text-red-800",
    icon: BadgeCheck,
  },
  REJECTED: {
    label: "Rejected",
    className: "border-rose-500/20 bg-rose-500/10 text-rose-400",
    icon: ShieldX,
  },
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
}

export default function KycSettings({ status, details, onChanged }: KycSettingsProps) {
  const [legalName, setLegalName] = useState(details?.legalName || "");
  const [dateOfBirth, setDateOfBirth] = useState(details?.dateOfBirth || "");
  const [country, setCountry] = useState(details?.country || "United Kingdom");
  const [address, setAddress] = useState(details?.address || "");
  const [documentType, setDocumentType] = useState(details?.documentType || "PASSPORT");
  const [documentReference, setDocumentReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const showForm = status === "NOT_STARTED" || status === "REJECTED";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          dateOfBirth,
          country,
          address,
          documentType,
          documentReference,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit KYC application");
      setMessage({
        type: "success",
        text: "Application submitted. Our compliance team will review it shortly.",
      });
      setDocumentReference("");
      await onChanged();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to submit KYC application",
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section id="kyc" className="rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6 scroll-mt-24">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-red-800" />
          <div>
            <h2 className="text-base font-bold text-[#2B0B0E]">Identity verification (KYC)</h2>
            <p className="text-xs text-[#6B1D1D]">
              Withdrawals require an approved identity check. Reviews are completed by our
              compliance team.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${meta.className}`}
        >
          <StatusIcon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-xl border p-3 text-xs ${
            message.type === "success"
              ? "border-red-400 bg-red-100 text-red-800"
              : "border-rose-500/20 bg-rose-500/10 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {status === "PENDING" && details && (
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 text-xs text-amber-100/80">
          <p className="font-semibold text-amber-300">Your application is being reviewed.</p>
          <p className="mt-1 text-[11px]">
            Submitted on {formatDate(details.submittedAt)} for {details.legalName}. We will update
            this page once the review is complete.
          </p>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#3F1414]">
            <div>
              <dt className="text-[#6B1D1D]">Document</dt>
              <dd>{details.documentType.replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt className="text-[#6B1D1D]">Country</dt>
              <dd>{details.country}</dd>
            </div>
          </dl>
        </div>
      )}

      {status === "APPROVED" && details && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs">
          <p className="font-semibold text-red-800">Identity verified</p>
          <p className="mt-1 text-[11px] text-red-900/70">
            Verified {details.reviewedAt ? `on ${formatDate(details.reviewedAt)}` : ""}. You can now
            request withdrawals to your saved payout wallets.
          </p>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#3F1414]">
            <div>
              <dt className="text-[#6B1D1D]">Legal name</dt>
              <dd>{details.legalName}</dd>
            </div>
            <div>
              <dt className="text-[#6B1D1D]">Country</dt>
              <dd>{details.country}</dd>
            </div>
          </dl>
        </div>
      )}

      {status === "REJECTED" && details?.rejectionReason && (
        <div className="mb-4 rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 text-xs text-rose-200">
          <p className="font-semibold text-rose-300">Previous application was rejected</p>
          <p className="mt-1 text-[11px]">{details.rejectionReason}</p>
          <p className="mt-1 text-[11px] text-rose-200/70">
            Correct the details below and submit a new application.
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kyc-legal-name" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                Full legal name
              </label>
              <input
                id="kyc-legal-name"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={legalName}
                onChange={(event) => setLegalName(event.target.value)}
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="kyc-dob" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                Date of birth
              </label>
              <input
                id="kyc-dob"
                type="date"
                required
                max={today}
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="kyc-country" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                Country of residence
              </label>
              <input
                id="kyc-country"
                type="text"
                required
                minLength={2}
                maxLength={56}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="kyc-document-type" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
                Document type
              </label>
              <select
                id="kyc-document-type"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="kyc-address" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
              Residential address
            </label>
            <textarea
              id="kyc-address"
              required
              minLength={10}
              maxLength={240}
              rows={2}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Street, city, postcode"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="kyc-document-reference" className="mb-1.5 block text-[11px] font-semibold uppercase text-[#5B1B1B]">
              Document number
            </label>
            <input
              id="kyc-document-reference"
              type="text"
              required
              minLength={4}
              maxLength={40}
              value={documentReference}
              onChange={(event) => setDocumentReference(event.target.value)}
              placeholder="e.g. passport number"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm font-mono text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
            <p className="mt-1.5 text-[10px] text-[#6B1D1D]">
              Enter the reference only. Never upload or share full document scans in chat.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit verification"}
          </button>
        </form>
      )}
    </section>
  );
}
