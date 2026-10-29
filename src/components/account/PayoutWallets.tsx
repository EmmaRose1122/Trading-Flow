"use client";

import { useState } from "react";
import { Check, CircleDollarSign, PlusCircle, Star, Trash2, Wallet } from "lucide-react";
import type { PayoutWallet } from "@/lib/db";

interface PayoutWalletsProps {
  wallets: PayoutWallet[];
  onChanged: () => Promise<void> | void;
}

const MAX_WALLETS = 10;

const METHODS = [
  "USDT (TRC20)",
  "USDT (ERC20)",
  "Bitcoin (BTC)",
  "Ethereum (ETH)",
  "Bank Transfer",
  "Other",
];

export default function PayoutWallets({ wallets, onChanged }: PayoutWalletsProps) {
  const [label, setLabel] = useState("");
  const [method, setMethod] = useState(METHODS[0]);
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [makeProfitDestination, setMakeProfitDestination] = useState(wallets.length === 0);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const addWallet = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          method,
          network,
          address,
          isProfitDestination: makeProfitDestination,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save payout wallet");
      setLabel("");
      setNetwork("");
      setAddress("");
      setMakeProfitDestination(false);
      setMessage({ type: "success", text: "Payout wallet saved." });
      await onChanged();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save payout wallet",
      });
    } finally {
      setLoading(false);
    }
  };

  const useAsDestination = async (walletId: string) => {
    setMessage(null);
    setBusyId(walletId);
    try {
      const response = await fetch("/api/user/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: walletId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update payout destination");
      setMessage({ type: "success", text: "Profit payout destination updated." });
      await onChanged();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update payout destination",
      });
    } finally {
      setBusyId(null);
    }
  };

  const removeWallet = async (walletId: string) => {
    const wallet = wallets.find((entry) => entry.id === walletId);
    if (!window.confirm(`Remove the "${wallet?.label || "selected"}" payout wallet?`)) return;
    setMessage(null);
    setBusyId(walletId);
    try {
      const response = await fetch(`/api/user/wallets?id=${encodeURIComponent(walletId)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to remove payout wallet");
      setMessage({ type: "success", text: "Payout wallet removed." });
      await onChanged();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to remove payout wallet",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section id="payout-wallets" className="rounded-2xl border border-red-900/20 bg-white p-5 sm:p-6 scroll-mt-24">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-red-800" />
          <div>
            <h2 className="text-base font-bold text-[#2B0B0E]">Payout wallets</h2>
            <p className="text-xs text-[#6B1D1D]">
              Save up to {MAX_WALLETS} payout accounts and choose the one that receives your
              profits and withdrawals.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-red-900/20 bg-white px-2.5 py-1 text-[9px] font-bold uppercase text-[#5B1B1B]">
          {wallets.length}/{MAX_WALLETS}
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

      {wallets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-red-900/20 p-5 text-center text-xs text-[#6B1D1D]">
          No payout wallets saved yet. Add one below so profit payouts have a verified destination.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {wallets.map((wallet) => (
            <li
              key={wallet.id}
              className={`rounded-xl border p-3.5 ${
                wallet.isProfitDestination
                  ? "border-red-400 bg-red-50"
                  : "border-red-900/20 bg-rose-50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[#2B0B0E]">{wallet.label}</p>
                    {wallet.isProfitDestination && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-400 bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800">
                        <CircleDollarSign className="h-3 w-3" />
                        Profit destination
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#6B1D1D]">
                    {wallet.method}
                    {wallet.network ? ` · ${wallet.network}` : ""}
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] text-[#3F1414]">
                    {wallet.address}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!wallet.isProfitDestination && (
                    <button
                      type="button"
                      disabled={busyId === wallet.id}
                      onClick={() => useAsDestination(wallet.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-400 bg-red-100 px-2.5 py-1.5 text-[10px] font-bold text-red-800 hover:bg-red-200 disabled:opacity-50"
                    >
                      {busyId === wallet.id ? <Check className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                      Use for profits
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === wallet.id}
                    onClick={() => removeWallet(wallet.id)}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    aria-label={`Remove ${wallet.label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {wallets.length < MAX_WALLETS && (
        <form onSubmit={addWallet} className="mt-5 space-y-3 border-t border-red-900/20 pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5B1B1B]">Add payout wallet</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="wallet-label" className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
                Label
              </label>
              <input
                id="wallet-label"
                type="text"
                required
                maxLength={80}
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="e.g. Main USDT wallet"
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="wallet-method" className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
                Method
              </label>
              <select
                id="wallet-method"
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] focus:border-red-700 focus:outline-none"
              >
                {METHODS.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="wallet-network" className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
                Network (optional)
              </label>
              <input
                id="wallet-network"
                type="text"
                maxLength={60}
                value={network}
                onChange={(event) => setNetwork(event.target.value)}
                placeholder="e.g. TRON"
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="wallet-address" className="mb-1 block text-[10px] font-semibold uppercase text-[#6B1D1D]">
                Wallet address / account
              </label>
              <input
                id="wallet-address"
                type="text"
                required
                minLength={6}
                maxLength={240}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Paste the payout address"
                className="w-full rounded-xl border border-red-900/20 bg-white px-3 py-2.5 font-mono text-sm text-[#2B0B0E] placeholder-[#8A4A4A] focus:border-red-700 focus:outline-none"
              />
            </div>
          </div>
          {wallets.length > 0 && (
            <label className="flex items-center gap-2 text-[11px] text-[#5B1B1B]">
              <input
                type="checkbox"
                checked={makeProfitDestination}
                onChange={(event) => setMakeProfitDestination(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-red-900/20 bg-white"
              />
              Use this wallet for profit payouts
            </label>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"
          >
            <PlusCircle className="h-4 w-4" />
            {loading ? "Saving..." : "Save payout wallet"}
          </button>
        </form>
      )}
    </section>
  );
}
