import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: "emerald" | "cyan" | "amber" | "indigo";
}

export default function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon: Icon,
  accentColor = "emerald",
}: MetricCardProps) {
  const colorMap = {
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/20",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-400 border-amber-500/20",
    indigo: "from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/20",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-5 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[accentColor]} flex items-center justify-center border`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
          {value}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {change && (
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
      </div>
    </div>
  );
}

