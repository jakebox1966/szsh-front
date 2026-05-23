import { DollarSign, Users, TrendingUp, Building2 } from "lucide-react";
import { SummaryCard, SourceBadge } from "../components";
import type { CompanySummary } from "../data";

type SummaryCardsSectionProps = {
  summary: CompanySummary;
};

export function SummaryCardsSection({ summary }: SummaryCardsSectionProps) {
  const salaryFromDart = !!summary.avgSalaryOfficial;
  const salaryValue = summary.avgSalaryOfficial ?? summary.avgSalary;
  const hasSalary = salaryValue && salaryValue !== "—" && salaryValue.trim() !== "";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        {hasSalary && (
          <div className="absolute -top-2 -right-2 shadow-sm rounded-md">
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
        value={summary.revenue}
        subtext="전년 대비 +14.2%"
        trend="up"
        source="DART"
      />
    </div>
  );
}
