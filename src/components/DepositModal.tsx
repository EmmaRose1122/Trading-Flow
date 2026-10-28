"use client";

import { useState } from "react";
import { X, Copy, Check, ArrowRight, ShieldAlert, QrCode } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [method, setMethod] = useState("USDT (TRC20)");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const addresses: Record<string, string> = {
    "USDT (TRC20)": "TNVbE1fB8QzLkmXzV8o14Y7J6Xk9Pq3Wa7",
    "Bitcoin (BTC)": "bc1q8x4f0k726af8yqlpt840x9812lkm904",
    "Ethereum (ERC20)": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  };

  const depositAddress = addresses[method] || addresses["USDT (TRC20)"];

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method, txHash }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Deposit submission failed");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-white/10 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Fund Your Wallet</h3>
        <p className="text-xs text-slate-400 mb-5">
          Select gateway, transfer to the designated address, and submit proof.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Select Deposit Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["USDT (TRC20)", "Bitcoin (BTC)", "Ethereum (ERC20)"].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    method === m
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {m.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Address Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Designated {method} Address:</span>
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                <QrCode className="w-3.5 h-3.5" /> Copy exactly
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg border border-white/5 font-mono text-xs text-slate-200">
              <span className="truncate">{depositAddress}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Deposit Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">$</span>
              <input
                type="number"
                min="10"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Minimum $10.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Transaction Hash / Reference (TxID)
            </label>
            <input
              type="text"
              required
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="e.g. 0x8f2a...9b42"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? "Submitting Request..." : "Submit Deposit Request"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

