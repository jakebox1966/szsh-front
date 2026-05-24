import { Globe, Sparkles, Briefcase, MapPin } from "lucide-react";
import type { CompanyInfo } from "../data";

type CompanyHeaderSectionProps = {
  info: CompanyInfo;
};

export function CompanyHeaderSection({ info }: CompanyHeaderSectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
              {info.name}
              {info.engName && (
                <span className="text-xs font-medium text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full mt-1">
                  {info.engName}
                </span>
              )}
              {info.isListed === true && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                  상장
                </span>
              )}
              {info.isListed === false && (
                <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full mt-1">
                  비상장
                </span>
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {info.industry}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{info.history}</span>
            </div>
          </div>
        </div>
        {info.website && (
          <div className="flex gap-2">
            <a
              href={`https://${info.website}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            >
              <Globe size={18} />
            </a>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(info.tags ?? []).map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100"
          >
            #{tag}
          </span>
        ))}
        <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
          <MapPin size={12} /> {info.address}
        </span>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Sparkles className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-gray-700 leading-relaxed">
          <span className="font-bold text-blue-800">AI 요약:</span> 동종 업계 대비{" "}
          <span className="font-semibold text-gray-900">상위 1% 수준의 연봉</span>을 제공하며, 최근
          3년간 매출액이 지속적으로 성장 중입니다. 다만, 최근 1년 기준 영업이익률은 소폭 감소
          추세이나 재무 건전성은 양호합니다. 개발 직군 기준 입사 선호도가 매우 높은 기업입니다.
        </div>
      </div>
    </div>
  );
}
