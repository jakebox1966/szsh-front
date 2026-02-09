import { DollarSign } from "lucide-react";
import type { CompanySalary } from "../data";

type SalaryDetailSectionProps = {
  salary: CompanySalary;
};

export function SalaryDetailSection({ salary }: SalaryDetailSectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="text-gray-400" size={20} />
          연봉 상세 분석
        </h2>
        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md border border-green-100">
          {salary.rank}
        </span>
      </div>

      <div className="mb-8 p-5 bg-gray-50 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500 mb-1">월 예상 실수령액</p>
          <p className="text-3xl font-bold text-gray-900">
            약 376만원(326만원)
            <span className="text-base font-normal text-gray-400 ml-1">/ 세전(세후)</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-600 mb-2">직급/연차별 예상 연봉 구간</p>
        {salary.structure.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="font-medium text-gray-700 w-32">{item.label}</span>
              <span className="text-right">{item.avg}만원</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex items-center">
              <div style={{ width: `${(item.min / 20000) * 100}%` }} />
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full relative group cursor-pointer"
                style={{ width: `${((item.max - item.min) / 20000) * 100}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {item.min}~{item.max}만원
                </div>
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-right text-gray-400 mt-2">
          * 자체 AI 알고리즘 추정치 (성과급 제외)
        </p>
      </div>
    </div>
  );
}
