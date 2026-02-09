import { Wallet } from "lucide-react";
import { netPayData } from "../data";

export function NetPayCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-center gap-2 mb-6 relative">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <Wallet size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">실수령액 미리보기</h3>
          <p className="text-xs text-gray-500">비과세액 미포함 기준</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 relative">
        {netPayData.map((data) => (
          <div
            key={data.gross}
            className="flex justify-between items-center py-2 border-b border-gray-50"
          >
            <span className="text-gray-500 text-sm">{data.gross}</span>
            <span className="font-bold text-[#1a1a1a] text-sm">{data.net}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
      >
        내 연봉으로 자세히 계산하기
      </button>
    </div>
  );
}
