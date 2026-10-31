"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Pause,
  Play,
  TrendingUp,
} from "lucide-react";

type ActivityType = "investment" | "profit" | "deposit" | "withdrawal";

interface DemoActivity {
  id: string;
  name: string;
  type: ActivityType;
  amount: number;
  status: "ACTIVE" | "SUCCESS" | "APPROVED" | "PENDING";
  detail: string;
  time: string;
}

const typeMeta = {
  investment: {
    label: "Daily investment",
    icon: TrendingUp,
    badge: "bg-red-700 text-white border-red-400",
  },
  profit: {
    label: "Daily profit",
    icon: CircleDollarSign,
    badge: "bg-yellow-400 text-black border-yellow-300",
  },
  deposit: {
    label: "Deposit",
    icon: ArrowDownLeft,
    badge: "bg-yellow-400 text-black border-yellow-300",
  },
  withdrawal: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    badge: "bg-red-700 text-white border-red-400",
  },
} as const;

const statusClass: Record<DemoActivity["status"], string> = {
  ACTIVE: "bg-red-900/60 text-red-100 border-red-500/50",
  SUCCESS: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  APPROVED: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  PENDING: "bg-red-900/60 text-red-100 border-red-500/50",
};

const demoActivities: DemoActivity[] = [
  { id: "INV-2041", name: "Amelia R.", type: "investment", amount: -5000, status: "ACTIVE", detail: "Daily 2% Plan", time: "2 min ago" },
  { id: "ROI-1041", name: "Noah T.", type: "profit", amount: 200, status: "SUCCESS", detail: "2% daily deposit profit", time: "4 min ago" },
  { id: "DEP-3041", name: "Sofia K.", type: "deposit", amount: 2500, status: "APPROVED", detail: "USDT · BEP20", time: "7 min ago" },
  { id: "WDR-4041", name: "James L.", type: "withdrawal", amount: -750, status: "PENDING", detail: "BEP20 · BSC", time: "11 min ago" },
  { id: "INV-2042", name: "Priya M.", type: "investment", amount: -1000, status: "ACTIVE", detail: "Daily 2% Plan", time: "15 min ago" },
  { id: "ROI-1042", name: "Adam H.", type: "profit", amount: 120, status: "SUCCESS", detail: "2% daily deposit profit", time: "19 min ago" },
  { id: "DEP-3042", name: "Emma S.", type: "deposit", amount: 10000, status: "APPROVED", detail: "USDT · BEP20", time: "24 min ago" },
  { id: "WDR-4042", name: "Daniel A.", type: "withdrawal", amount: -320, status: "APPROVED", detail: "USDC · BEP20", time: "31 min ago" },
  { id: "INV-2043", name: "Maya N.", type: "investment", amount: -15000, status: "ACTIVE", detail: "Daily 2% Plan", time: "38 min ago" },
  { id: "ROI-1043", name: "Oliver B.", type: "profit", amount: 450, status: "SUCCESS", detail: "2% daily deposit profit", time: "44 min ago" },
  { id: "DEP-3043", name: "Zara Q.", type: "deposit", amount: 500, status: "PENDING", detail: "USDT · BEP20", time: "51 min ago" },
  { id: "WDR-4043", name: "Lucas P.", type: "withdrawal", amount: -1250, status: "PENDING", detail: "BEP20 · BSC", time: "1 hr ago" },
  { id: "INV-2044", name: "Aisha F.", type: "investment", amount: -2500, status: "ACTIVE", detail: "Daily 2% Plan", time: "1 hr ago" },
  { id: "ROI-1044", name: "Ethan C.", type: "profit", amount: 50, status: "SUCCESS", detail: "2% daily deposit profit", time: "2 hrs ago" },
  { id: "DEP-3044", name: "Grace W.", type: "deposit", amount: 1800, status: "APPROVED", detail: "USDC · BEP20", time: "2 hrs ago" },
  { id: "WDR-4044", name: "Hamza D.", type: "withdrawal", amount: -400, status: "APPROVED", detail: "USDT · BEP20", time: "3 hrs ago" },
  { id: "INV-2045", name: "Chloe J.", type: "investment", amount: -8000, status: "ACTIVE", detail: "Daily 2% Plan", time: "3 hrs ago" },
  { id: "ROI-1045", name: "Leo V.", type: "profit", amount: 160, status: "SUCCESS", detail: "2% daily deposit profit", time: "4 hrs ago" },
  { id: "DEP-3045", name: "Hannah G.", type: "deposit", amount: 3000, status: "APPROVED", detail: "USDT · BEP20", time: "4 hrs ago" },
  { id: "WDR-4045", name: "Samir I.", type: "withdrawal", amount: -980, status: "PENDING", detail: "BEP20 · BSC", time: "5 hrs ago" },
  { id: "INV-2046", name: "Isla E.", type: "investment", amount: -450, status: "ACTIVE", detail: "Daily 2% Plan", time: "5 hrs ago" },
  { id: "ROI-1046", name: "Theo M.", type: "profit", amount: 90, status: "SUCCESS", detail: "2% daily deposit profit", time: "6 hrs ago" },
  { id: "DEP-3046", name: "Nina O.", type: "deposit", amount: 6400, status: "PENDING", detail: "USDT · BEP20", time: "6 hrs ago" },
  { id: "WDR-4046", name: "Ryan K.", type: "withdrawal", amount: -2100, status: "APPROVED", detail: "USDC · BEP20", time: "7 hrs ago" },
];

function formatMoney(amount: number) {
  return `${amount >= 0 ? "+" : "-"}$${Math.abs(amount).toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DemoActivityCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || hovering || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % demoActivities.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, hovering, reducedMotion]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[activeIndex] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeIndex, reducedMotion]);

  const goTo = (index: number) => {
    setActiveIndex((index + demoActivities.length) % demoActivities.length);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          24 illustrative activity records
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="w-8 h-8 rounded-lg border border-yellow-400/25 bg-black text-yellow-300 hover:bg-red-700 hover:text-white flex items-center justify-center transition"
            aria-label="Previous activity"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="w-8 h-8 rounded-lg border border-yellow-400/25 bg-black text-yellow-300 hover:bg-red-700 hover:text-white flex items-center justify-center transition"
            aria-label={paused ? "Play activity animation" : "Pause activity animation"}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="w-8 h-8 rounded-lg border border-yellow-400/25 bg-black text-yellow-300 hover:bg-red-700 hover:text-white flex items-center justify-center transition"
            aria-label="Next activity"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label="Illustrative platform activity carousel"
        aria-roledescription="carousel"
        tabIndex={0}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocusCapture={() => setHovering(true)}
        onBlurCapture={() => setHovering(false)}
        className="relative flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {demoActivities.map((activity, index) => {
          const meta = typeMeta[activity.type];
          const Icon = meta.icon;
          const positive = activity.amount >= 0;
          return (
            <article
              key={activity.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Illustrative ${meta.label} record ${index + 1} of ${demoActivities.length}`}
              className={`snap-start shrink-0 w-[278px] sm:w-[296px] rounded-2xl border p-4 transition-all duration-500 ${
                index === activeIndex
                  ? "border-red-500/60 bg-gradient-to-b from-[#1B0F10] to-[#0B0B0C] shadow-[0_20px_50px_-20px_rgba(220,38,38,0.55)]"
                  : "border-yellow-400/15 bg-[#101010]"
              }`}
            >
              <div className="mb-3 h-0.5 w-10 rounded-full bg-gradient-to-r from-red-500 via-red-400 to-yellow-400" />
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${meta.badge}`}>
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400">Account</p>
                  <p className="mt-0.5 text-sm font-bold text-white truncate">{activity.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400">Amount</p>
                  <p className={`mt-0.5 text-lg font-extrabold tracking-tight ${positive ? "text-yellow-300" : "text-red-800"}`}>
                    {formatMoney(activity.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-neutral-400">Record ID</span>
                  <span className="font-mono text-neutral-200 truncate">{activity.id}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-neutral-400">Details</span>
                  <span className="text-neutral-200 truncate">{activity.detail}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusClass[activity.status]}`}>
                  {activity.status}
                </span>
                <span className="text-[9px] text-neutral-500">{activity.time}</span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-1 text-[10px] text-neutral-400">
        Illustrative activity records only. Names, IDs, balances and activity are sample data and are not real customer records.
      </p>
    </div>
  );
}
