import { formatKRWCompact } from "@/lib/format";

export type FinanceMetricProps = {
  label: string;
  value: number;           // 원
  growth: string;          // 이미 포맷된 % 문자열 ("+14.2%" / "-10.9%")
};

export function FinanceMetric({ label, value, growth }: FinanceMetricProps) {
  const isGrowthPositive = (growth ?? "").startsWith("+");
  return (
    <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <span className="text-base font-bold text-foreground">{formatKRWCompact(value)}</span>
      <span
        className={`text-xs font-medium ${isGrowthPositive ? "text-red-500" : "text-blue-500"}`}
      >
        {growth}
      </span>
    </div>
  );
}
