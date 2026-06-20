import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SourceBadge } from "./SourceBadge";

export type SummaryCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  trend: "up" | "down" | "neutral";
  trendColor?: string;
  source?: "DART" | "NPS";
};

export function SummaryCard({
  icon,
  label,
  value,
  subtext,
  trend,
  trendColor,
  source,
}: SummaryCardProps) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  const textColor =
    trendColor ?? (isUp ? "text-red-500" : isDown ? "text-blue-500" : "text-muted-foreground");

  // 값 없으면 (빈 문자열 또는 "—") 출처 뱃지 숨김 — 데이터 없는데 출처 표시 부자연스러움
  const hasValue = value && value !== "—" && value.trim() !== "";

  return (
    <div className="relative bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      {source && hasValue && (
        <div className="absolute -top-2 -right-2 flex shadow-sm rounded-md">
          <SourceBadge source={source} />
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-muted rounded-lg shrink-0">{icon}</div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-bold text-foreground tracking-tight mb-2">{value}</div>
      <div className={`text-xs font-medium flex items-center gap-0.5 ${textColor}`}>
        {isUp && <ArrowUpRight size={12} className="shrink-0" />}
        {isDown && <ArrowDownRight size={12} className="shrink-0" />}
        <span>{subtext}</span>
      </div>
    </div>
  );
}
