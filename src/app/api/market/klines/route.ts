import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT"];
const ALLOWED_INTERVALS = ["15m", "1h", "4h", "1d"];
const HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"];
const TTL_MS = 10_000;

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const cache = new Map<string, { payload: unknown; at: number }>();

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const interval = searchParams.get("interval") || "1h";
  const limit = Math.min(500, Math.max(30, Number.parseInt(searchParams.get("limit") || "300", 10) || 300));

  if (!ALLOWED_SYMBOLS.includes(symbol)) {
    return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
  }
  if (!ALLOWED_INTERVALS.includes(interval)) {
    return NextResponse.json({ error: "Unsupported interval" }, { status: 400 });
  }

  const key = `${symbol}:${interval}:${limit}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.at < TTL_MS) {
    return NextResponse.json(cached.payload);
  }

  try {
    const klines = (await fetchFromHosts(
      `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    )) as unknown[];
    const candles: Candle[] = klines.map((k) => {
      const row = k as string[];
      return {
        time: Math.floor(Number(row[0]) / 1000),
        open: Number(row[1]),
        high: Number(row[2]),
        low: Number(row[3]),
        close: Number(row[4]),
        volume: Number(row[5]),
      };
    });
    const payload = {
      symbol,
      interval,
      candles,
      source: "Binance public market data",
      updatedAt: new Date(now).toISOString(),
    };
    cache.set(key, { payload, at: now });
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Live market data is temporarily unavailable." },
      { status: 502 }
    );
  }
}
