"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, ArrowRight, ShieldAlert, Wallet } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepositAccountOption {
  id: string;
  label: string;
  method: string;
  network?: string;
  currency: string;
  address: string;
  accountName?: string;
  instructions?: string;
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [accounts, setAccounts] = useState<DepositAccountOption[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [error, setError] = useState("");

  const account = accounts.find((entry) => entry.id === accountId) || null;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setAmount("");
    setTxHash("");
    setError("");
    setCopied(false);
    setAccountsLoading(true);

    fetch("/api/deposit-accounts", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load deposit methods.");
        if (cancelled) return;
        const nextAccounts = Array.isArray(data.accounts) ? data.accounts : [];
        setAccounts(nextAccounts);
        setAccountId(nextAccounts[0]?.id || "");
        if (nextAccounts.length === 0) {
          setError("No deposit methods are currently available. Please contact support.");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load deposit methods.");
      })
      .finally(() => {
        if (!cancelled) setAccountsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!account) {
      setError("Select a deposit method first.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, txHash, depositAccountId: account.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Deposit submission failed");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/35 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-red-900/20 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#5B1B1B] hover:text-[#2B0B0E]"
          aria-label="Close deposit dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#2B0B0E] mb-1">Fund Your Wallet</h3>
        <p className="text-xs text-[#5B1B1B] mb-5">
          Choose an admin-approved receiving account, complete the transfer, then submit the
          transaction reference. The deposit starts earning 2% daily 24 hours after approval.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
              Deposit Method
            </label>
            {accountsLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-900/20 bg-white px-3 py-3 text-xs text-[#5B1B1B]">
                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Loading available accounts...
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-red-900/20 bg-rose-50 px-3 py-4 text-xs text-[#5B1B1B]">
                No active deposit accounts are available.
              </div>
            ) : (
              <select
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] text-sm focus:outline-none focus:border-red-700"
              >
                {accounts.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label} {entry.network ? `· ${entry.network}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {account && (
            <div className="p-3.5 rounded-xl bg-white border border-red-900/20 space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#5B1B1B]">
                  <Wallet className="w-3.5 h-3.5 text-red-800" />
                  {account.accountName || account.method}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-red-800">
                  {account.currency}
                  {account.network ? ` · ${account.network}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-rose-50 p-2 rounded-lg border border-red-900/20 font-mono text-xs text-[#2B0B0E]">
                <span className="truncate">{account.address}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-rose-50 text-[#5B1B1B] hover:text-red-900 transition"
                  aria-label="Copy deposit address"
                >
                  {copied ? <Check className="w-4 h-4 text-red-800" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {account.instructions && (
                <p className="text-[10px] text-[#6B1D1D] leading-relaxed">{account.instructions}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
              Deposit Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#6B1D1D] text-sm font-semibold">$</span>
              <input
                type="number"
                min="10"
                step="any"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Minimum $10.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#5B1B1B] mb-1.5">
              Transaction Hash / Reference
            </label>
            <input
              type="text"
              required
              value={txHash}
              onChange={(event) => setTxHash(event.target.value)}
              placeholder="Enter the transfer hash or bank reference"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-sm focus:outline-none focus:border-red-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading || accountsLoading || !account}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
          >
            {loading ? "Submitting Request..." : "Submit Deposit Request"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
