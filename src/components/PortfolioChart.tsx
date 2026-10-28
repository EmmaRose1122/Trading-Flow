"use client";

import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Transaction } from "@/lib/db";

interface PortfolioChartProps {
  transactions: Transaction[];
  currentBalance: number;
}

const ranges: Record<string, number | null> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  ALL: null,
};

function balanceEffect(tx: Transaction) {
  if (tx.status === "REJECTED") return 0;
  if (tx.status === "PENDING" && tx.type !== "WITHDRAWAL") return 0;
  if (["DEPOSIT", "PROFIT", "CAPITAL_RETURN", "BONUS", "REFERRAL"].includes(tx.type)) return tx.amount;
  if (["WITHDRAWAL", "INVESTMENT"].includes(tx.type)) return -(tx.amount + tx.fee);
  return 0;
}

export default function PortfolioChart({ transactions, currentBalance }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState("1M");

  const allPoints = useMemo(() => {
    const chronological = [...transactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let balance = currentBalance;
    const descending = [{ label: "Now", value: balance, timestamp: Date.now() }];

    for (let i = chronological.length - 1; i >= 0; i -= 1) {
      const tx = chronological[i];
      balance = Math.round((balance - balanceEffect(tx)) * 100) / 100;
      descending.push({
        label: new Date(tx.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: balance,
        timestamp: new Date(tx.createdAt).getTime(),
      });
    }

    return descending.reverse();
  }, [transactions, currentBalance]);

  const dataPoints = useMemo(() => {
    const days = ranges[timeRange];
    if (days === null) return allPoints;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recent = allPoints.filter((point) => point.timestamp >= cutoff);
    const firstRecentIndex = allPoints.indexOf(recent[0]);
    const startingPoint = firstRecentIndex > 0 ? [allPoints[firstRecentIndex - 1]] : [];
    return [...startingPoint, ...recent];
  }, [allPoints, timeRange]);

  const width = 600;
  const height = 180;
  const values = dataPoints.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.15, 10);
  const minValue = rawMin - padding;
  const maxValue = rawMax + padding;
  const coordinates = dataPoints.map((point, index) => ({
    x: dataPoints.length === 1 ? width / 2 : (index / (dataPoints.length - 1)) * (width - 40) + 20,
    y: height - ((point.value - minValue) / (maxValue - minValue)) * (height - 40) - 20,
  }));
  const pathD = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`).join(" ");
  const areaD = `${pathD} L ${coordinates[coordinates.length - 1]?.x || width / 2},${height} L ${coordinates[0]?.x || width / 2},${height} Z`;
  const firstValue = dataPoints[0]?.value || 0;
  const change = firstValue === 0 ? 0 : ((currentBalance - firstValue) / Math.abs(firstValue)) * 100;
  const isPositive = change >= 0;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-base">Wallet Balance History</h3>
            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${isPositive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? "+" : ""}{change.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-400">Available balance calculated from ledger activity</p>
        </div>
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5">
          {Object.keys(ranges).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${timeRange === range ? "bg-emerald-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {dataPoints.length < 2 ? (
        <div className="h-48 sm:h-56 flex items-center justify-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
          Not enough wallet activity for this period.
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-56 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#080C15" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[30, 80, 130].map((y) => (
              <line key={y} x1="20" y1={y} x2={width - 20} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            ))}
            <path d={areaD} fill="url(#chartGradient)" />
            <path d={pathD} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {coordinates.map((point, index) => (
              <g key={`${dataPoints[index].timestamp}-${index}`}>
                <title>{`${dataPoints[index].label}: $${dataPoints[index].value.toFixed(2)}`}</title>
                <circle cx={point.x} cy={point.y} r="4" fill="#080C15" stroke="#10B981" strokeWidth="2.5" />
              </g>
            ))}
          </svg>
          <div className="flex justify-between text-[11px] text-slate-500 font-medium px-2 pt-2">
            {dataPoints.map((point, index) => (
              <span key={`${point.timestamp}-${index}`}>{point.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
