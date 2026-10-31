import type { Metadata } from "next";
import { headers } from "next/headers";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

const MarketTerminal = dynamic(() => import("@/components/site/MarketTerminal"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-[#0B0B0C]">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
    </div>
  ),
});

export const metadata: Metadata = createPageMetadata({
  title: "Live Trading Candlestick Charts",
  description:
    "Follow real-time BTC, ETH, BNB, SOL, XRP and DOGE candlestick charts with live prices, 24-hour stats and trend signals from public exchange data.",
  path: "/markets",
  keywords: [
    "live candlestick chart",
    "real-time crypto chart",
    "BTC USDT chart",
    "trading view market data",
    "CoreChain markets",
  ],
});

export default function MarketsPage() {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd("Markets", "/markets")).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative overflow-hidden border-b border-red-900/20 bg-[#0B0B0C] py-14 sm:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-700/15 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-200">Markets</span>
          </nav>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live market terminal
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Candlestick charts, the way traders expect.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                Real-time OHLC candles, timeframes, 24-hour statistics and trend labels for six
                major pairs. Data comes from public exchange APIs and refreshes automatically.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-yellow-300"
            >
              Open investor portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MarketTerminal />
          <p className="mt-4 text-[10px] leading-relaxed text-[#6B1D1D]">
            Market data is sourced from public exchange APIs and may be delayed. Candlestick charts
            and trend labels are informational and are not investment advice, recommendations or
            guarantees of future performance. Digital-asset values can fall as well as rise, and
            capital is at risk.
          </p>
        </div>
      </section>
    </>
  );
}
