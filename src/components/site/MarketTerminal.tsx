"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { ArrowDownRight, ArrowUpRight, CandlestickChart, Minus, Radio } from "lucide-react";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TickerItem {
  symbol: string;
  pair: string;
  price: number;
  changePct: number;
  high: number;
  low: number;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
}

const SYMBOLS = [
  { symbol: "BTC", pair: "BTCUSDT" },
  { symbol: "ETH", pair: "ETHUSDT" },
  { symbol: "BNB", pair: "BNBUSDT" },
  { symbol: "SOL", pair: "SOLUSDT" },
  { symbol: "XRP", pair: "XRPUSDT" },
  { symbol: "DOGE", pair: "DOGEUSDT" },
];

const INTERVALS = [
  { value: "15m", label: "15m" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
];

function movingAverage(values: number[], window: number) {
  if (values.length === 0) return 0;
  const slice = values.slice(-window);
  return slice.reduce((total, value) => total + value, 0) / slice.length;
}

function formatPrice(price: number) {
  if (!price) return "—";
  const decimals = price < 1 ? 5 : price < 100 ? 3 : 2;
  return price.toLocaleString("en-SG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCompact(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}

export default function MarketTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [pair, setPair] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("1h");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [ticker, setTicker] = useState<TickerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const loadKlines = useCallback(
    async (targetPair: string, targetInterval: string, replace: boolean) => {
      try {
        const response = await fetch(
          `/api/market/klines?symbol=${targetPair}&interval=${targetInterval}&limit=300`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.candles)) {
          throw new Error(data.error || "Market data unavailable");
        }
        const items = data.candles as Candle[];
        setCandles(items);
        setUpdatedAt(
          new Date(data.updatedAt).toLocaleTimeString("en-SG", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
        setError("");

        const chart = chartRef.current;
        const series = seriesRef.current;
        if (!chart || !series) return;
        if (replace || items.length === 0) {
          series.setData(
            items.map((c) => ({
              time: c.time as UTCTimestamp,
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
            }))
          );
          chart.timeScale().fitContent();
        } else {
          const last = items[items.length - 1];
          series.update({
            time: last.time as UTCTimestamp,
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Market data unavailable");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadTicker = useCallback(async (targetPair: string) => {
    try {
      const response = await fetch("/api/market/signals", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const item = (data.items as TickerItem[])?.find((entry) => entry.pair === targetPair);
      if (item) setTicker(item);
    } catch {
      // keep last ticker on transient errors
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#0B0B0C" },
        textColor: "#A38F90",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "#DC2626", labelBackgroundColor: "#7F1D1D" },
        horzLine: { color: "#DC2626", labelBackgroundColor: "#7F1D1D" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      localization: { priceFormatter: (price: number) => formatPrice(price) },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#16A34A",
      downColor: "#DC2626",
      wickUpColor: "#16A34A",
      wickDownColor: "#DC2626",
      borderVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resize = () => {
      chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    loadKlines(pair, interval, true);
    loadTicker(pair);
  }, [pair, interval, loadKlines, loadTicker]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadKlines(pair, interval, false);
      loadTicker(pair);
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [pair, interval, loadKlines, loadTicker]);

  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 0;
  const ma20 = movingAverage(
    candles.map((c) => c.close),
    20
  );
  const signal: TickerItem["signal"] =
    ticker && ticker.changePct >= 0.05 && lastClose > ma20
      ? "BULLISH"
      : ticker && ticker.changePct <= -0.05 && lastClose < ma20
        ? "BEARISH"
        : "NEUTRAL";
  const change = ticker?.changePct ?? 0;
  const positive = change >= 0;
  const volume = candles.reduce((total, c) => total + c.volume, 0);

  const selectSymbol = (nextPair: string) => setPair(nextPair);
  const selectInterval = (nextInterval: string) => setIntervalValue(nextInterval);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0B0B0C] p-4 shadow-2xl shadow-red-950/30 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {SYMBOLS.map((item) => (
            <button
              key={item.pair}
              type="button"
              onClick={() => selectSymbol(item.pair)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition ${
                pair === item.pair
                  ? "bg-yellow-400 text-black"
                  : "border border-white/10 bg-white/5 text-neutral-300 hover:text-white"
              }`}
            >
              {item.symbol}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {INTERVALS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => selectInterval(item.value)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                interval === item.value
                  ? "bg-red-700 text-white"
                  : "border border-white/10 bg-white/5 text-neutral-300 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Last price</p>
          <p className="mt-1 text-lg font-extrabold text-white">
            ${formatPrice(ticker?.price ?? lastClose)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">24h change</p>
          <p className={`mt-1 inline-flex items-center gap-1 text-lg font-extrabold ${positive ? "text-emerald-400" : "text-red-400"}`}>
            {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {change.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">24h high</p>
          <p className="mt-1 text-lg font-extrabold text-white">${formatPrice(ticker?.high ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">24h low</p>
          <p className="mt-1 text-lg font-extrabold text-white">${formatPrice(ticker?.low ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Volume</p>
          <p className="mt-1 text-lg font-extrabold text-white">{formatCompact(volume)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Trend signal</p>
          <p className="mt-1 text-lg font-extrabold">
            {signal === "BULLISH" && <span className="text-emerald-400">Bullish</span>}
            {signal === "BEARISH" && <span className="text-red-400">Bearish</span>}
            {signal === "NEUTRAL" && <span className="text-neutral-300">Neutral</span>}
          </p>
        </div>
      </div>

      <div className="relative mt-4 h-[300px] overflow-hidden rounded-2xl border border-white/10 sm:h-[420px] xl:h-[480px]">
        {loading && candles.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0B0C]/80">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      <div className="mt-3 flex flex-col gap-2 text-[10px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 text-red-400" />
          {error ? error : updatedAt ? `Updated ${updatedAt} · refreshes every 15s` : "Connecting to market feed…"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CandlestickChart className="h-3.5 w-3.5 text-neutral-500" />
          Candles from public Binance market data · not financial advice
        </span>
      </div>
    </section>
  );
}
