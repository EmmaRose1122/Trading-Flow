"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Pencil,
  PlusCircle,
  Power,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import type { DepositAccount } from "@/lib/db";

interface DepositAccountManagerProps {
  onChanged?: () => Promise<void> | void;
}

interface AccountForm {
  label: string;
  method: string;
  network: string;
  currency: string;
  address: string;
  accountName: string;
  instructions: string;
}

const EMPTY_FORM: AccountForm = {
  label: "",
  method: "",
  network: "",
  currency: "USD",
  address: "",
  accountName: "",
  instructions: "",
};

export default function DepositAccountManager({ onChanged }: DepositAccountManagerProps) {
  const [accounts, setAccounts] = useState<DepositAccount[]>([]);
  const [form, setForm] = useState<AccountForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/deposit-accounts", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load deposit accounts");
      setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load deposit accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key: keyof AccountForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (account: DepositAccount) => {
    setEditingId(account.id);
    setForm({
      label: account.label,
      method: account.method,
      network: account.network || "",
      currency: account.currency || "USD",
      address: account.address,
      accountName: account.accountName || "",
      instructions: account.instructions || "",
    });
    setError("");
    setMessage("");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/deposit-accounts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save deposit account");
      setMessage(editingId ? "Deposit account updated." : "Deposit account added.");
      resetForm();
      await load();
      if (onChanged) await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save deposit account");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (account: DepositAccount) => {
    setBusyId(account.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/deposit-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, isActive: !account.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update deposit account");
      setMessage(account.isActive ? "Deposit account disabled." : "Deposit account enabled.");
      await load();
      if (onChanged) await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update deposit account");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (account: DepositAccount) => {
    if (!window.confirm(`Delete the "${account.label}" receiving account? Users will no longer see it.`)) {
      return;
    }
    setBusyId(account.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/deposit-accounts?id=${encodeURIComponent(account.id)}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete deposit account");
      if (editingId === account.id) resetForm();
      setMessage("Deposit account deleted.");
      await load();
      if (onChanged) await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete deposit account");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="glass-card rounded-2xl p-6 border border-red-300">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-red-800" />
          <div>
            <h3 className="font-bold text-[#2B0B0E] text-base">
              Deposit Receiving Accounts ({accounts.length})
            </h3>
            <p className="text-[11px] text-[#6B1D1D]">
              Active accounts appear in the user deposit flow. Never show inactive accounts.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/20 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#3F1414] hover:text-[#2B0B0E]"
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
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-400 bg-red-100 p-3 text-xs text-red-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-red-900/20 p-5 text-xs text-[#5B1B1B]">
          <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-red-900/20 p-6 text-center text-xs text-[#6B1D1D]">
          No deposit accounts configured. Add one below to start accepting deposits.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {accounts.map((account) => (
            <li
              key={account.id}
              className={`rounded-xl border p-3.5 ${
                account.isActive
                  ? "border-red-900/20 bg-rose-50"
                  : "border-rose-500/10 bg-rose-50 opacity-70"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#2B0B0E]">{account.label}</p>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        account.isActive
                          ? "bg-red-100 text-red-800 border border-red-400"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {account.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#6B1D1D]">
                    {account.method}
                    {account.network ? ` · ${account.network}` : ""} · {account.currency}
                    {account.accountName ? ` · ${account.accountName}` : ""}
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] text-[#3F1414]">
                    {account.address}
                  </p>
                  {account.instructions && (
                    <p className="mt-1 text-[10px] text-[#6B1D1D]">{account.instructions}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={busyId === account.id}
                    onClick={() => startEdit(account)}
                    className="rounded-lg border border-red-400 bg-red-100 p-1.5 text-red-800 hover:bg-red-200 disabled:opacity-50"
                    aria-label={`Edit ${account.label}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === account.id}
                    onClick={() => toggleActive(account)}
                    className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-1.5 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                    aria-label={account.isActive ? `Disable ${account.label}` : `Enable ${account.label}`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === account.id}
                    onClick={() => remove(account)}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    aria-label={`Delete ${account.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={save} className="mt-5 space-y-3 border-t border-red-900/20 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5B1B1B]">
            {editingId ? "Edit deposit account" : "Add deposit account"}
          </p>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#5B1B1B] hover:text-[#2B0B0E]"
            >
              <X className="w-3 h-3" /> Cancel edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
              Label
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={form.label}
              onChange={(event) => update("label", event.target.value)}
              placeholder="e.g. USDT (TRC20)"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
              Method
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={form.method}
              onChange={(event) => update("method", event.target.value)}
              placeholder="e.g. Bank Transfer"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
              Network (optional)
            </label>
            <input
              type="text"
              maxLength={60}
              value={form.network}
              onChange={(event) => update("network", event.target.value)}
              placeholder="e.g. TRON"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
              Currency
            </label>
            <input
              type="text"
              maxLength={20}
              value={form.currency}
              onChange={(event) => update("currency", event.target.value)}
              placeholder="USD"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
              Receiving address / account details
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={240}
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
              placeholder="Wallet address or bank account details"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 font-mono text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
              Account name (optional)
            </label>
            <input
              type="text"
              maxLength={120}
              value={form.accountName}
              onChange={(event) => update("accountName", event.target.value)}
              placeholder="CoreChain"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
              Instructions (optional)
            </label>
            <input
              type="text"
              maxLength={300}
              value={form.instructions}
              onChange={(event) => update("instructions", event.target.value)}
              placeholder="Send only USDT on TRC20"
              className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          {saving ? "Saving..." : editingId ? "Update account" : "Add account"}
        </button>
      </form>
    </section>
  );
}
