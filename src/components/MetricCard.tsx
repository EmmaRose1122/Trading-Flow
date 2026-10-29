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
    emerald: "from-red-700/20 to-red-800/0 text-red-800 border-red-400",
    cyan: "from-red-200 to-white text-red-800 border-red-400",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-400 border-amber-500/20",
    indigo: "from-rose-200 to-white text-red-800 border-red-400",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-5 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-[#5B1B1B]">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[accentColor]} flex items-center justify-center border`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold tracking-tight text-[#2B0B0E] group-hover:text-red-900 transition-colors">
          {value}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {change && (
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
              isPositive
                ? "bg-red-100 text-red-800 border border-red-400"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && <span className="text-[#5B1B1B] truncate">{subtitle}</span>}
      </div>
    </div>
  );
}

