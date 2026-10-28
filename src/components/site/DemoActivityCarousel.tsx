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
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
  profit: {
    label: "Daily profit",
    icon: CircleDollarSign,
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
  deposit: {
    label: "Deposit",
    icon: ArrowDownLeft,
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  },
  withdrawal: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
} as const;

const statusClass: Record<DemoActivity["status"], string> = {
  ACTIVE: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  SUCCESS: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  APPROVED: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/20",
};

const demoActivities: DemoActivity[] = [
  { id: "INV-DEMO-2041", name: "Amelia R.", type: "investment", amount: -5000, status: "ACTIVE", detail: "Premium Growth · 30 days", time: "2 min ago" },
  { id: "ROI-DEMO-1041", name: "Noah T.", type: "profit", amount: 200, status: "SUCCESS", detail: "Premium Growth · daily ROI", time: "4 min ago" },
  { id: "DEP-DEMO-3041", name: "Sofia K.", type: "deposit", amount: 2500, status: "APPROVED", detail: "USDT · TRC20", time: "7 min ago" },
  { id: "WDR-DEMO-4041", name: "James L.", type: "withdrawal", amount: -750, status: "PENDING", detail: "Bitcoin network", time: "11 min ago" },
  { id: "INV-DEMO-2042", name: "Priya M.", type: "investment", amount: -1000, status: "ACTIVE", detail: "Premium Growth · 30 days", time: "15 min ago" },
  { id: "ROI-DEMO-1042", name: "Adam H.", type: "profit", amount: 120, status: "SUCCESS", detail: "Starter · daily ROI", time: "19 min ago" },
  { id: "DEP-DEMO-3042", name: "Emma S.", type: "deposit", amount: 10000, status: "APPROVED", detail: "Bank wire · GBP", time: "24 min ago" },
  { id: "WDR-DEMO-4042", name: "Daniel A.", type: "withdrawal", amount: -320, status: "APPROVED", detail: "USDT · ERC20", time: "31 min ago" },
  { id: "INV-DEMO-2043", name: "Maya N.", type: "investment", amount: -15000, status: "ACTIVE", detail: "VIP Capital · 60 days", time: "38 min ago" },
  { id: "ROI-DEMO-1043", name: "Oliver B.", type: "profit", amount: 450, status: "SUCCESS", detail: "VIP Capital · daily ROI", time: "44 min ago" },
  { id: "DEP-DEMO-3043", name: "Zara Q.", type: "deposit", amount: 500, status: "PENDING", detail: "USDT · TRC20", time: "51 min ago" },
  { id: "WDR-DEMO-4043", name: "Lucas P.", type: "withdrawal", amount: -1250, status: "PENDING", detail: "Bitcoin network", time: "1 hr ago" },
  { id: "INV-DEMO-2044", name: "Aisha F.", type: "investment", amount: -2500, status: "ACTIVE", detail: "Premium Growth · 30 days", time: "1 hr ago" },
  { id: "ROI-DEMO-1044", name: "Ethan C.", type: "profit", amount: 50, status: "SUCCESS", detail: "Premium Growth · daily ROI", time: "2 hrs ago" },
  { id: "DEP-DEMO-3044", name: "Grace W.", type: "deposit", amount: 1800, status: "APPROVED", detail: "USDT · ERC20", time: "2 hrs ago" },
  { id: "WDR-DEMO-4044", name: "Hamza D.", type: "withdrawal", amount: -400, status: "APPROVED", detail: "USDT · TRC20", time: "3 hrs ago" },
  { id: "INV-DEMO-2045", name: "Chloe J.", type: "investment", amount: -8000, status: "ACTIVE", detail: "Premium Growth · 30 days", time: "3 hrs ago" },
  { id: "ROI-DEMO-1045", name: "Leo V.", type: "profit", amount: 160, status: "SUCCESS", detail: "Premium Growth · daily ROI", time: "4 hrs ago" },
  { id: "DEP-DEMO-3045", name: "Hannah G.", type: "deposit", amount: 3000, status: "APPROVED", detail: "Bank wire · GBP", time: "4 hrs ago" },
  { id: "WDR-DEMO-4045", name: "Samir I.", type: "withdrawal", amount: -980, status: "PENDING", detail: "Bitcoin network", time: "5 hrs ago" },
  { id: "INV-DEMO-2046", name: "Isla E.", type: "investment", amount: -450, status: "ACTIVE", detail: "Starter · 15 days", time: "5 hrs ago" },
  { id: "ROI-DEMO-1046", name: "Theo M.", type: "profit", amount: 90, status: "SUCCESS", detail: "VIP Capital · daily ROI", time: "6 hrs ago" },
  { id: "DEP-DEMO-3046", name: "Nina O.", type: "deposit", amount: 6400, status: "PENDING", detail: "USDT · TRC20", time: "6 hrs ago" },
  { id: "WDR-DEMO-4046", name: "Ryan K.", type: "withdrawal", amount: -2100, status: "APPROVED", detail: "USDT · ERC20", time: "7 hrs ago" },
];

function formatMoney(amount: number) {
  return `${amount >= 0 ? "+" : "-"}$${Math.abs(amount).toLocaleString("en-GB", {
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
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          24 simulated activity records
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900 text-slate-400 hover:text-white hover:border-emerald-500/30 flex items-center justify-center transition"
            aria-label="Previous demo activity"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900 text-slate-400 hover:text-white hover:border-emerald-500/30 flex items-center justify-center transition"
            aria-label={paused ? "Play demo activity animation" : "Pause demo activity animation"}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900 text-slate-400 hover:text-white hover:border-emerald-500/30 flex items-center justify-center transition"
            aria-label="Next demo activity"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label="Simulated platform activity carousel"
        aria-roledescription="carousel"
        tabIndex={0}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocusCapture={() => setHovering(true)}
        onBlurCapture={() => setHovering(false)}
        className="relative flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              aria-label={`Simulated ${meta.label} record ${index + 1} of ${demoActivities.length}`}
              className={`snap-start shrink-0 w-[278px] sm:w-[296px] rounded-2xl border p-4 transition-all duration-500 ${
                index === activeIndex
                  ? "border-emerald-500/35 bg-[#0E1928] shadow-lg shadow-emerald-500/5"
                  : "border-white/5 bg-[#0A111D]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${meta.badge}`}>
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 border border-white/5 rounded px-1.5 py-0.5">
                  Demo
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">Account</p>
                  <p className="mt-0.5 text-sm font-bold text-white truncate">{activity.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">Amount</p>
                  <p className={`mt-0.5 text-lg font-extrabold tracking-tight ${positive ? "text-emerald-400" : "text-slate-200"}`}>
                    {formatMoney(activity.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-slate-500">Record ID</span>
                  <span className="font-mono text-slate-300 truncate">{activity.id}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-slate-500">Details</span>
                  <span className="text-slate-300 truncate">{activity.detail}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusClass[activity.status]}`}>
                  {activity.status}
                </span>
                <span className="text-[9px] text-slate-600">{activity.time}</span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-1 text-[10px] text-slate-600">
        Simulated demo ledger only. Names, IDs, balances and activity are fictional and are not real
        customer records.
      </p>
    </div>
  );
}
