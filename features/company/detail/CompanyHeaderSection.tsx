import { Globe, Briefcase, MapPin } from "lucide-react";
import type { CompanyInfo } from "../data";

type CompanyHeaderSectionProps = {
  info: CompanyInfo;
  children?: React.ReactNode;   // 카드 하단에 끼울 추가 콘텐츠 (예: KeySignalsSection)
};

export function CompanyHeaderSection({ info, children }: CompanyHeaderSectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm mb-6">
      <div className="flex justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
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
              {info.industryGroup && (
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full mt-1">
                  {info.industryGroup.label}
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
          <a
            href={`https://${info.website}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0"
            aria-label="회사 홈페이지"
          >
            <Globe size={18} />
          </a>
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

      {children}
    </div>
  );
}
