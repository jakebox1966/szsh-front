import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { salaryRanking } from "../data";

export function SalaryRankingCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">
            평균 연봉 TOP 기업
          </h3>
          <p className="text-sm text-gray-500 mt-1">2024년 공시 자료 기반 분석</p>
        </div>
        <button
          type="button"
          className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>

      <div className="space-y-1">
        {salaryRanking.map((item, index) => (
          <Link
            key={item.name}
            href={`/company/${item.slug}`}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <span
                className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-mono
                  ${index < 3 ? "bg-black text-white" : "bg-gray-100 text-gray-500"}
                `}
              >
                {item.rank}
              </span>
              <span className="font-semibold text-gray-800">{item.name}</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="font-bold text-gray-900 text-sm">
                {item.amount}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  item.change.startsWith("+") ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.change}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
