import { Building2 } from "lucide-react";
import { FinanceMetric } from "../components";
import type { CompanyFinance } from "../data";

type FinanceSectionProps = {
  finance: CompanyFinance;
};

export function FinanceSection({ finance }: FinanceSectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Building2 className="text-gray-400" size={20} />
        재무 성장성
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <FinanceMetric
          label="매출액"
          value={finance.revenue.current}
          growth={finance.revenue.growth}
        />
        <FinanceMetric
          label="영업이익"
          value={finance.operatingProfit.current}
          growth={finance.operatingProfit.growth}
        />
        <FinanceMetric
          label="당기순이익"
          value={finance.netProfit.current}
          growth={finance.netProfit.growth}
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-700 mb-6 text-center">연도별 매출액 추이</p>
        <div className="flex items-end justify-center gap-12 h-40">
          {finance.history.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group w-16">
              <div className="text-sm font-bold text-gray-900 group-hover:-translate-y-1 transition-transform">
                {item.rev}조
              </div>
              <div
                className="w-full bg-blue-50 rounded-t-lg relative overflow-hidden"
                style={{ height: `${item.rev * 12}px` }}
              >
                <div className="absolute bottom-0 w-full bg-blue-600 hover:bg-blue-700 transition-colors h-full opacity-90" />
              </div>
              <div className="text-xs text-gray-500 font-medium">{item.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
