import { Sparkles } from "lucide-react";
import { SalaryRankingCard } from "./SalaryRankingCard";
import { NetPayCard } from "./NetPayCard";
import { EmployeeGrowthCard } from "./EmployeeGrowthCard";
import { RegionalTopCard } from "./RegionalTopCard";

export function InsightSection() {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 px-1">
        <Sparkles size={14} className="text-blue-500" />
        <span>AI 추천 인사이트</span>
      </div>

      <SalaryRankingCard />
      <NetPayCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmployeeGrowthCard />
        <RegionalTopCard />
      </div>
    </div>
  );
}
