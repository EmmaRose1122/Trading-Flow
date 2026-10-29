"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchTxs = useCallback(async () => {
    setLoadError("");
    try {
      const authRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!authRes.ok) {
        router.replace("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setCurrentBalance(authData.wallet?.currentBalance || 0);

      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load transaction history.");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : "Unable to load transaction history.");
    } finally {
      setLoading(false);
    }
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#FFFFFF]">
        <Navbar user={user} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#2B0B0E]">Ledger could not be loaded</h1>
          <p className="mt-2 text-sm text-[#5B1B1B]">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchTxs();
            }}
            className="mt-6 px-5 py-2.5 rounded-xl bg-red-700 text-white text-sm font-bold"
          >
            Retry
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-28 lg:pb-12">
      <Navbar
        user={user}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2B0B0E] tracking-tight">Audit & Transaction Ledger</h1>
            <p className="text-xs text-[#5B1B1B]">
              Verified on-chain and internal ledger history with cryptographic reference tags
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-red-900/20 hover:bg-rose-50 text-[#2B0B0E] text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5B1B1B] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by TxID, amount, status, method..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] placeholder-[#8A4A4A] text-xs focus:outline-none focus:border-red-700"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["ALL", "PROFIT", "DEPOSIT", "WITHDRAWAL", "INVESTMENT", "REFERRAL"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  type === t
                    ? "bg-red-700 text-white shadow-sm"
                    : "text-[#5B1B1B] hover:text-[#2B0B0E] bg-rose-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-red-900/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50 border-b border-red-900/20 text-[#5B1B1B] uppercase text-[10px] tracking-wider font-semibold">
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
              <tbody className="divide-y divide-red-900/10 text-[#3F1414]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#6B1D1D]">
                      No matching records located in the ledger.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => {
                    const isPositive =
                      tx.type === "DEPOSIT" ||
                      tx.type === "PROFIT" ||
                      tx.type === "CAPITAL_RETURN" ||
                      tx.type === "REFERRAL" ||
                      (tx.type === "BONUS" && tx.amount >= 0);
                    return (
                      <tr key={tx.id} className="hover:bg-rose-50 transition">
                        <td className="py-3.5 px-4 text-[#5B1B1B] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()} {" "}
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#2B0B0E] whitespace-nowrap">
                          {tx.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                              tx.type === "PROFIT"
                                ? "bg-red-700/15 text-red-800 border border-red-400"
                                : tx.type === "DEPOSIT"
                                ? "bg-red-100 text-red-800 border border-red-400"
                                : tx.type === "WITHDRAWAL"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                : tx.type === "REFERRAL"
                                ? "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/20"
                                : "bg-red-700/15 text-red-800 border border-red-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                          <span className={isPositive ? "text-red-800" : "text-[#2B0B0E]"}>
                            {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                          {tx.fee > 0 && (
                            <span className="text-[10px] text-[#6B1D1D] block">
                              Fee: ${tx.fee.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#3F1414] whitespace-nowrap">
                          {tx.method}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#5B1B1B] truncate max-w-xs">
                          {tx.txHash || tx.destination || tx.note || "N/A"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                              tx.status === "APPROVED" || tx.status === "SUCCESS"
                                ? "bg-red-100 text-red-800 border border-red-400"
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

