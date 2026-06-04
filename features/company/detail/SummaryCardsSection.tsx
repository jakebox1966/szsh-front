import { DollarSign, Users, TrendingUp, Building2 } from "lucide-react";
import { SummaryCard, SourceBadge } from "../components";
import type { CompanySummary } from "../data";

type SummaryCardsSectionProps = {
  summary: CompanySummary;
  revenueValue?: string; // finance 기준 포맷 매출(DART). 성장률과 같은 소스로 통일.
  revenueGrowth?: string; // 포맷된 전년대비 % (예: "+14.2%"). 없으면 빈 문자열
};

export function SummaryCardsSection({ summary, revenueValue, revenueGrowth }: SummaryCardsSectionProps) {
  // 매출 값: finance(DART) 우선, 없으면 요약값 fallback (성장률 출처와 일치시켜 뱃지 누락 방지)
  const revenueDisplay =
    revenueValue && revenueValue.trim() !== "" ? revenueValue : summary.revenue;
  const salaryFromDart = !!summary.avgSalaryOfficial;
  const salaryValue = summary.avgSalaryOfficial ?? summary.avgSalary;
  const hasSalary = salaryValue && salaryValue !== "—" && salaryValue.trim() !== "";

  // 하드코딩 제거 — 실제 매출 성장률 사용 (부호: + → up(빨강), - → down(파랑))
  const hasGrowth = !!revenueGrowth && revenueGrowth.trim() !== "" && revenueGrowth !== "—";
  const growthTrend: "up" | "down" | "neutral" = !hasGrowth
    ? "neutral"
    : revenueGrowth!.startsWith("-")
      ? "down"
      : "up";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        {hasSalary && (
          <div className="absolute -top-2 -right-2 flex shadow-sm rounded-md">
            <SourceBadge source={salaryFromDart ? "DART" : "NPS"} />
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-green-50 rounded-lg text-green-600 shrink-0">
            <DollarSign size={18} />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {salaryFromDart ? "DART 공시 평균연봉" : "추정 평균연봉"}
          </span>
        </div>
        <div className="text-lg md:text-xl font-bold text-gray-900 mb-2">
          {summary.avgSalaryOfficial ?? summary.avgSalary}
        </div>
        <div className="text-xs text-gray-400">
          {salaryFromDart
            ? "DART 사업보고서 기준"
            : summary.avgSalaryCapped
              ? "국민연금 기반 추정치 (상한 적용)"
              : "국민연금 기반 추정치"}
        </div>
      </div>

      <SummaryCard
        icon={<Users size={18} className="text-blue-600" />}
        label="총 재직자 수"
        value={summary.totalEmployees}
        subtext="국민연금 가입 기준"
        trend="neutral"
        source="NPS"
      />
      <SummaryCard
        icon={<TrendingUp size={18} className="text-purple-600" />}
        label="최근 퇴사율"
        value={summary.turnoverRate}
        subtext="동종 업계 평균 이하"
        trend="down"
        trendColor="text-blue-600"
        source="NPS"
      />
      <SummaryCard
        icon={<Building2 size={18} className="text-orange-600" />}
        label="최근 매출액"
        value={revenueDisplay}
        subtext={hasGrowth ? `전년 대비 ${revenueGrowth}` : ""}
        trend={growthTrend}
        source="DART"
      />
    </div>
  );
}
