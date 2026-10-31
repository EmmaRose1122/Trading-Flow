import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ASSETS = [
  { symbol: "BTC", pair: "BTCUSDT" },
  { symbol: "ETH", pair: "ETHUSDT" },
  { symbol: "BNB", pair: "BNBUSDT" },
  { symbol: "SOL", pair: "SOLUSDT" },
  { symbol: "XRP", pair: "XRPUSDT" },
  { symbol: "DOGE", pair: "DOGEUSDT" },
];

const HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"];
const TTL_MS = 20_000;

interface TickerEntry {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
}

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

let cache: { payload: Record<string, unknown>; at: number } | null = null;

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromHosts(path: string, timeoutMs = 6000): Promise<unknown> {
  let lastError: unknown = null;
  for (const host of HOSTS) {
    try {
      return await fetchJson(`${host}${path}`, timeoutMs);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Market data unavailable");
}

function movingAverage(values: number[], window: number) {
  if (values.length === 0) return 0;
  const slice = values.slice(-window);
  return slice.reduce((total, value) => total + value, 0) / slice.length;
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    return NextResponse.json(cache.payload);
  }

  try {
    const symbolsParam = encodeURIComponent(JSON.stringify(ASSETS.map((asset) => asset.pair)));
    const tickers = (await fetchFromHosts(
      `/api/v3/ticker/24hr?symbols=${symbolsParam}`
    )) as TickerEntry[];

    const klineResults = await Promise.all(
      ASSETS.map(async (asset) => {
        try {
          const klines = (await fetchFromHosts(
            `/api/v3/klines?symbol=${asset.pair}&interval=1h&limit=20`,
            5000
          )) as unknown[];
          return { pair: asset.pair, closes: klines.map((k) => Number((k as string[])[4])) };
        } catch {
          return { pair: asset.pair, closes: [] as number[] };
        }
      })
    );

    const items: MarketItem[] = ASSETS.map((asset) => {
      const ticker = tickers.find((entry) => entry.symbol === asset.pair);
      const kline = klineResults.find((entry) => entry.pair === asset.pair);
      const closes = kline?.closes ?? [];
      const last = closes.length > 0 ? closes[closes.length - 1] : 0;
      const ma20 = movingAverage(closes, 20);
      const changePct = Number(ticker?.priceChangePercent || 0);
      const signal: MarketItem["signal"] =
        changePct >= 0.05 && last > ma20
          ? "BULLISH"
          : changePct <= -0.05 && last < ma20
            ? "BEARISH"
            : "NEUTRAL";
      return {
        symbol: asset.symbol,
        pair: asset.pair,
        price: Number(ticker?.lastPrice || 0),
        changePct,
        high: Number(ticker?.highPrice || 0),
        low: Number(ticker?.lowPrice || 0),
        signal,
        closes,
      };
    });

    const payload = {
      items,
      source: "Binance public market data",
      updatedAt: new Date(now).toISOString(),
    };
    cache = { payload, at: now };
    return NextResponse.json(payload);
  } catch (error) {
    const payload = {
      error: true,
      message:
        error instanceof Error && error.name === "AbortError"
          ? "Live market feed timed out. Please refresh in a moment."
          : "Live market feed is temporarily unavailable.",
      updatedAt: new Date(now).toISOString(),
    };
    cache = { payload, at: now };
    return NextResponse.json(payload, { status: 200 });
  }
}
