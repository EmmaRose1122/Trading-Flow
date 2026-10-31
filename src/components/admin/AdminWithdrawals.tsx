"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import type { Transaction } from "@/lib/db";

interface BscStatus {
  enabled: boolean;
  configured: boolean;
  chainId: number;
  tokenAddress: string | null;
  rpcHost: string | null;
  explorerUrl: string;
}

interface AdminWithdrawalsProps {
  onChanged?: () => Promise<void> | void;
}

const FILTERS = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "REJECTED"] as const;

function statusClass(status: Transaction["status"]) {
  if (status === "COMPLETED" || status === "APPROVED" || status === "SUCCESS") {
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  }
  if (status === "PENDING") {
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  }
  if (status === "PROCESSING") {
    return "bg-cyan-500/10 text-cyan-700 border-cyan-500/20";
  }
  return "bg-red-500/10 text-red-700 border-red-500/20";
}

export default function AdminWithdrawals({ onChanged }: AdminWithdrawalsProps) {
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [bsc, setBsc] = useState<BscStatus | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/withdrawals", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load withdrawals");
      setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
      setBsc(data.bsc || null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load withdrawals",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const action = async (
    id: string,
    path: "approve" | "reject" | "retry" | "refund",
    body: Record<string, unknown> = {}
  ) => {
    if (busyId) return;
    setBusyId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/withdrawals/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Withdrawal action failed");
      setMessage({
        type: "success",
        text:
          path === "approve"
            ? `Withdrawal completed. TxHash: ${data.txHash}`
            : path === "reject"
              ? "Withdrawal rejected and the locked amount refunded."
              : path === "refund"
                ? data.verifiedReverted
                  ? "On-chain reverted transaction verified and the failed withdrawal refunded."
                  : "Failed withdrawal refunded to the user's wallet."
                : data.verified
                  ? "On-chain transaction verified and withdrawal completed."
                  : "Withdrawal reset to pending for a new attempt.",
      });
      setRejectReasons((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      await load();
      if (onChanged) await onChanged();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Withdrawal action failed",
      });
      await load();
      if (onChanged) await onChanged();
    } finally {
      setBusyId(null);
    }
  };

  const filtered = withdrawals.filter(
    (withdrawal) => filter === "ALL" || withdrawal.status === filter
  );
  const bscReady = Boolean(bsc?.enabled && bsc?.configured);
  const explorerBase = bsc?.explorerUrl || "https://bscscan.com";

  return (
    <section className="glass-card rounded-2xl p-6 border border-yellow-400/25">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-base">BEP20 Withdrawals</h3>
          <p className="text-[11px] text-[#8A6A6D]">
            Approve to sign and broadcast a token transfer from the platform hot wallet.
          </p>
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

      {bsc && (
        <div
          className={`mb-3 rounded-xl border p-3 text-[10px] ${
            bscReady
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
              : "border-amber-500/20 bg-amber-500/10 text-amber-700"
          }`}
        >
          {bscReady
            ? `Hot wallet ready · chain ${bsc.chainId} · token ${bsc.tokenAddress} · RPC ${bsc.rpcHost}`
            : "BSC auto-withdrawal is not ready. Set BSC_WITHDRAWALS_ENABLED, BSC_RPC_URL, HOT_WALLET_PRIVATE_KEY and BEP20_TOKEN_CONTRACT_ADDRESS in the server environment."}
        </div>
      )}

      {message && (
        <div
          className={`mb-3 flex items-start gap-2 rounded-xl border p-3 text-xs ${
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
              : "border-red-500/20 bg-red-500/10 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="break-all">{message.text}</span>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setFilter(entry)}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
              filter === entry
                ? "bg-yellow-400 text-black"
                : "border border-white/10 bg-slate-900 text-slate-300 hover:text-white"
            }`}
          >
            {entry} ({entry === "ALL" ? withdrawals.length : withdrawals.filter((item) => item.status === entry).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 p-5 text-xs text-slate-400">
          <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          Loading withdrawals...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">
          No withdrawals in this status.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((withdrawal) => {
            const isBusy = busyId === withdrawal.id;
            return (
              <article key={withdrawal.id} className="rounded-xl border border-white/5 bg-[#141414] p-3.5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-white">
                        ${withdrawal.amount.toFixed(2)}
                      </p>
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${statusClass(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                      <span className="text-[9px] text-neutral-500">
                        Fee ${withdrawal.fee.toFixed(2)} · {new Date(withdrawal.createdAt).toLocaleString("en-SG")}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-300">
                      {withdrawal.userName || "User"} · {withdrawal.userEmail || ""}
                    </p>
                    <p className="mt-1 break-all font-mono text-[10px] text-yellow-300">
                      {withdrawal.destination || "No destination"}
                    </p>
                    <p className="mt-1 text-[9px] text-neutral-500">
                      ID: {withdrawal.id} · {withdrawal.method}
                    </p>
                    {withdrawal.txHash && (
                      <a
                        href={`${explorerBase}/tx/${withdrawal.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 hover:underline"
                      >
                        {withdrawal.txHash}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {withdrawal.errorMessage && (
                      <p className="mt-1 flex items-start gap-1 text-[10px] text-red-300">
                        <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                        {withdrawal.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {withdrawal.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy || !bscReady}
                          onClick={() => action(withdrawal.id, "approve")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-[10px] font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                        >
                          {isBusy ? (
                            <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {isBusy ? "Broadcasting to BSC..." : "Approve & Send Auto"}
                        </button>
                        <input
                          type="text"
                          value={rejectReasons[withdrawal.id] || ""}
                          onChange={(event) =>
                            setRejectReasons((current) => ({
                              ...current,
                              [withdrawal.id]: event.target.value,
                            }))
                          }
                          placeholder="Reject reason"
                          className="w-32 rounded-lg border border-white/10 bg-[#0B0B0C] px-2 py-2 text-[10px] text-white placeholder-neutral-500 focus:border-yellow-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            action(withdrawal.id, "reject", {
                              reason: rejectReasons[withdrawal.id] || "",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}
                    {withdrawal.status === "FAILED" && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => action(withdrawal.id, "retry")}
                          className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
                        >
                          {withdrawal.txHash ? "Verify on-chain" : "Retry"}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          title={
                            withdrawal.txHash
                              ? "Verifies the receipt on BSC and refunds only if the transfer reverted."
                              : "Refunds the locked amount plus fee to the user's wallet."
                          }
                          onClick={() => action(withdrawal.id, "refund")}
                          className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          {withdrawal.txHash ? "Verify & Refund" : "Refund"}
                        </button>
                      </>
                    )}
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
