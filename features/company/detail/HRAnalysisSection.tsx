import { Users } from "lucide-react";
import type { CompanyHR } from "../data";

type HRAnalysisSectionProps = {
  hr: CompanyHR;
  turnoverRate: string;
};

export function HRAnalysisSection({ hr, turnoverRate }: HRAnalysisSectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Users className="text-gray-400" size={20} />
        인력 유동성 분석
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-4 rounded-2xl text-center">
            <p className="text-xs text-blue-600 font-semibold mb-1">최근 6개월 입사</p>
            <p className="text-xl font-bold text-blue-900">+{hr.incoming}명</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <p className="text-xs text-gray-500 font-semibold mb-1">최근 6개월 퇴사</p>
            <p className="text-xl font-bold text-gray-700">-{hr.outgoing}명</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">월별 입/퇴사 추이</p>
          <div className="space-y-3">
            {hr.trends.map((item, idx) => (
              <div key={idx} className="flex items-center text-xs">
                <span className="w-8 text-gray-400 font-medium">{item.month}</span>
                <div className="flex-1 flex items-center gap-1 h-2 bg-gray-100 rounded-full mx-2 overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${item.in}%` }} />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="h-full bg-red-300" style={{ width: `${item.out}%` }} />
                </div>
                <div className="w-16 flex justify-end gap-2 text-[10px] font-mono">
                  <span className="text-blue-600">+{item.in}</span>
                  <span className="text-red-400">-{item.out}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />입사
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-300" />퇴사
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">올해 퇴사율 예상</span>
            <span className="text-sm font-bold text-gray-900">{turnoverRate}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-green-500 h-full w-[8%]" />
          </div>
          <p className="text-xs text-green-600 mt-1">안정적 (IT업계 평균 15% 대비 낮음)</p>
        </div>
      </div>
    </div>
  );
}
