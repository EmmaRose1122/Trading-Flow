"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Minus, Radio } from "lucide-react";

interface MarketItem {
  symbol: string;
  pair: string;
  price: number;
  changePct: number;
  high: number;
  low: number;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  closes: number[];
}

interface MarketPayload {
  items?: MarketItem[];
  error?: boolean;
  message?: string;
  updatedAt?: string;
}

function formatPrice(price: number) {
  if (!price) return "—";
  const decimals = price < 1 ? 4 : price < 100 ? 3 : 2;
  return price.toLocaleString("en-SG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Sparkline({ closes, tone }: { closes: number[]; tone: string }) {
  if (closes.length < 2) return null;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const points = closes
    .map((value, index) => {
      const x = (index / (closes.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
      <polyline
        points={points}
        fill="none"
        stroke={tone}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SignalChip({ signal }: { signal: MarketItem["signal"] }) {
  if (signal === "BULLISH") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-300">
        <ArrowUpRight className="h-3 w-3" />
        Bullish
      </span>
    );
  }
  if (signal === "BEARISH") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-red-300">
        <ArrowDownRight className="h-3 w-3" />
        Bearish
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-neutral-300">
      <Minus className="h-3 w-3" />
      Neutral
    </span>
  );
}

export default function LiveSignalOverview() {
  const [payload, setPayload] = useState<MarketPayload | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/market/signals", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as MarketPayload;
      setPayload(data);
    } catch {
      // keep the previous snapshot on transient network errors
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("CoreChainAndroid")) {
      return;
    }
    load();
    const timer = setInterval(load, 25_000);
    return () => clearInterval(timer);
  }, [load]);

  if (typeof navigator !== "undefined" && navigator.userAgent.includes("CoreChainAndroid")) {
    return null;
  }

  const items = payload?.items ?? [];
  const cards: Array<MarketItem | undefined> =
    items.length > 0 ? items : Array.from({ length: 6 });
  const updatedLabel = payload?.updatedAt
    ? new Date(payload.updatedAt).toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <section id="live-signals" className="relative overflow-hidden border-y border-red-900/20 bg-[#0B0B0C] py-16 sm:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-red-700/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Live trading signal overview
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Market moves, updated in real time.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              Prices, 24-hour changes and trend labels are pulled from public exchange data and
              refreshed automatically. Trend labels are informational summaries, not trading
              recommendations.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-red-400" />
              {payload?.error ? "Feed unavailable" : updatedLabel ? `Updated ${updatedLabel}` : "Connecting…"}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Refreshes every ~25s</span>
          </div>
        </div>

        {payload?.error ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <Activity className="mx-auto h-6 w-6 text-neutral-500" />
            <p className="mt-3 text-sm text-neutral-300">
              {payload.message || "Live market feed is temporarily unavailable."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {cards.map((item, index) => {
              if (!item) {
                return (
                  <div
                    key={index}
                    className="h-[168px] animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                );
              }
              const positive = item.changePct >= 0;
              const sparkTone = item.signal === "BULLISH" ? "#FACC15" : item.signal === "BEARISH" ? "#F87171" : "#A3A3A3";
              return (
                <article key={item.pair} className="rounded-2xl border border-white/10 bg-[#141414] p-4 transition-colors hover:border-red-400/30">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-white">{item.symbol}</p>
                      <p className="text-[9px] uppercase tracking-wider text-neutral-500">
                        {item.symbol}/USDT
                      </p>
                    </div>
                    <SignalChip signal={item.signal} />
                  </div>
                  <p className="mt-2 text-lg font-extrabold tracking-tight text-white">
                    ${formatPrice(item.price)}
                  </p>
                  <p
                    className={`mt-0.5 text-[10px] font-bold ${
                      positive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {item.changePct.toFixed(2)}% · 24h
                  </p>
                  <div className="mt-2">
                    <Sparkline closes={item.closes} tone={sparkTone} />
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] text-neutral-500">
                    <span>H {formatPrice(item.high)}</span>
                    <span>L {formatPrice(item.low)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-5 text-[10px] leading-relaxed text-neutral-500">
          Market data is sourced from public exchange APIs and may be delayed. Signal labels are a
          simple trend summary (price change plus short-term average) and are not investment
          advice, a recommendation or a guarantee of future performance. Capital is at risk.
        </p>
      </div>
    </section>
  );
}
