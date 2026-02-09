import { DollarSign, Users, TrendingUp, Building2 } from "lucide-react";
import { SummaryCard } from "../components";
import type { CompanySummary } from "../data";

type SummaryCardsSectionProps = {
  summary: CompanySummary;
};

export function SummaryCardsSection({ summary }: SummaryCardsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
            <DollarSign size={18} />
          </div>
          <span className="text-xs text-gray-500 font-medium">예상 연봉 정보</span>
        </div>
        <div className="flex flex-col">
          <div className="mb-1">
            <span className="text-xs text-gray-400 block mb-0.5">평균</span>
            <span className="text-lg md:text-xl font-bold text-gray-900">{summary.avgSalary}</span>
          </div>
          <div className="border-t border-gray-50 pt-1 mt-1">
            <span className="text-xs text-gray-400 block mb-0.5">신입 초봉(대졸)</span>
            <span className="text-base font-semibold text-gray-700">{summary.startSalary}</span>
          </div>
        </div>
      </div>

      <SummaryCard
        icon={<Users size={18} className="text-blue-600" />}
        label="총 재직자 수"
        value={summary.totalEmployees}
        subtext="국민연금 가입 기준"
        trend="neutral"
      />
      <SummaryCard
        icon={<TrendingUp size={18} className="text-purple-600" />}
        label="최근 퇴사율"
        value={summary.turnoverRate}
        subtext="동종 업계 평균 이하"
        trend="down"
        trendColor="text-blue-600"
      />
      <SummaryCard
        icon={<Building2 size={18} className="text-orange-600" />}
        label="최근 매출액"
        value={summary.revenue}
        subtext="전년 대비 +14.2%"
        trend="up"
      />
    </div>
  );
}
