import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export type SummaryCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  trend: "up" | "down" | "neutral";
  trendColor?: string;
};

export function SummaryCard({
  icon,
  label,
  value,
  subtext,
  trend,
  trendColor,
}: SummaryCardProps) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  const textColor =
    trendColor ?? (isUp ? "text-red-500" : isDown ? "text-blue-500" : "text-gray-500");

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-1">{value}</div>
      <div className={`text-xs font-medium flex items-center gap-0.5 ${textColor}`}>
        {isUp && <ArrowUpRight size={12} />}
        {isDown && <ArrowDownRight size={12} />}
        {subtext}
      </div>
    </div>
  );
}
