"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Transaction, User } from "@/lib/db";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTxs = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setUser(authData.user);
        setCurrentBalance(authData.wallet?.currentBalance || 0);
      }

      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTxs();
  }, [fetchTxs]);

  const filtered = transactions.filter((tx) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      tx.id.toLowerCase().includes(query) ||
      tx.type.toLowerCase().includes(query) ||
      tx.status.toLowerCase().includes(query) ||
      tx.method.toLowerCase().includes(query) ||
      tx.amount.toFixed(2).includes(query) ||
      (tx.txHash && tx.txHash.toLowerCase().includes(query)) ||
      (tx.note && tx.note.toLowerCase().includes(query));

    const matchesType = type === "ALL" || tx.type === type;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const escapeCell = (value: string | number) => {
      let text = String(value);
      if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const headers = ["TxID", "Date", "Type", "Amount", "Fee", "Method", "Status", "Reference", "Note"];
    const rows = filtered.map((t) => [
      t.id,
      t.createdAt,
      t.type,
      t.amount.toFixed(2),
      t.fee.toFixed(2),
      t.method,
      t.status,
      t.txHash || t.destination || "",
      t.note || "",
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tradingflow_transactions_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080C15] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Audit & Transaction Ledger</h1>
            <p className="text-xs text-slate-400">
              Verified on-chain and internal ledger history with cryptographic reference tags
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by TxID, amount, status, method..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["ALL", "PROFIT", "DEPOSIT", "WITHDRAWAL", "INVESTMENT"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  type === t
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-900/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method / Route</th>
                  <th className="py-3.5 px-4">Reference / Hash</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No matching records located in the ledger.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => {
                    const isPositive =
                      tx.type === "DEPOSIT" ||
                      tx.type === "PROFIT" ||
                      tx.type === "CAPITAL_RETURN" ||
                      (tx.type === "BONUS" && tx.amount >= 0);
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()} {" "}
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                          {tx.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                              tx.type === "PROFIT"
                                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                                : tx.type === "DEPOSIT"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : tx.type === "WITHDRAWAL"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                          <span className={isPositive ? "text-emerald-400" : "text-slate-200"}>
                            {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                          {tx.fee > 0 && (
                            <span className="text-[10px] text-slate-500 block">
                              Fee: ${tx.fee.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {tx.method}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                          {tx.txHash || tx.destination || tx.note || "N/A"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                              tx.status === "APPROVED" || tx.status === "SUCCESS"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : tx.status === "PENDING"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {tx.status === "APPROVED" || tx.status === "SUCCESS" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={fetchTxs}
      />
      <WithdrawModal
        isOpen={withdrawOpen}
        currentBalance={currentBalance}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={fetchTxs}
      />
    </div>
  );
}

