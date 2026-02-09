import { Users } from "lucide-react";
import { employeeGrowth } from "../data";

export function EmployeeGrowthCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-blue-500" />
        <h3 className="font-bold text-[#1a1a1a]">인원 급상승 🚀</h3>
      </div>
      <div className="space-y-3">
        {employeeGrowth.map((company) => (
          <div
            key={company.name}
            className="flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-gray-800 text-sm">
                {company.name}
              </div>
              <div className="text-xs text-gray-400">{company.count}</div>
            </div>
            <div className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-xs">
              {company.growth}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
