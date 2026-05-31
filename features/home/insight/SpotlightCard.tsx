"use client";

import Link from "next/link";
import type { ApiSpotlight } from "@/lib/api-types";
import { formatKRW, formatPercent } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";

type SpotlightCardProps = {
  data: ApiSpotlight;
};

function renderMetricValue(item: ApiSpotlight["items"][number], metric: ApiSpotlight["metric"]) {
  if (metric === "salary") {
    return (
      <span className="font-bold text-gray-900 text-sm">
        {item.salary ? formatKRW(item.salary, { unit: false }) : "—"}
      </span>
    );
  }
  if (metric === "revenue") {
    return (
      <div className="flex flex-col items-end">
        <span className="font-bold text-gray-900 text-sm">
          {item.revenue ? formatKRW(item.revenue, { unit: false }) : "—"}
        </span>
        {item.revenueGrowth != null && (
          <span
            className={`text-[10px] font-medium ${
              item.revenueGrowth >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {formatPercent(item.revenueGrowth)}
          </span>
        )}
      </div>
    );
  }
  // growth
  return (
    <div className="flex flex-col items-end">
      <span className="font-bold text-gray-900 text-sm">
        {item.employees ? `${item.employees.toLocaleString()}명` : "—"}
      </span>
      {item.employeeGrowth != null && (
        <span className="text-[10px] font-medium text-green-600">
          {formatPercent(item.employeeGrowth)}
        </span>
      )}
    </div>
  );
}

export function SpotlightCard({ data }: SpotlightCardProps) {
  const empty = data.items.length === 0;
  const rankStart = data.rankStart ?? 1;     // 페이지 로테이션 (1 또는 6)
  // GA from_path 매핑 — 매출/평균연봉 외 metric 은 home_field_revenue 로 fallback
  const trackingPath: "home_field_revenue" | "home_field_salary" =
    data.metric === "salary" ? "home_field_salary" : "home_field_revenue";

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="mb-6">
        <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full mb-2">
          오늘의 분야 · {data.groupLabel}
        </span>
        <h3 className="text-lg font-bold text-[#1a1a1a]">
          {data.metricLabel}
        </h3>
        {data.dataAsOf && (
          <p className="text-sm text-gray-500 mt-1">{data.dataAsOf}</p>
        )}
      </div>

      {empty ? (
        <p className="text-sm text-gray-400 text-center py-8">데이터가 없습니다.</p>
      ) : (
        <div className="space-y-1">
          {data.items.map((item, index) => (
            <Link
              key={item.slug}
              href={`/company/${item.slug}`}
              onClick={() =>
                trackEvent("company_detail", {
                  from_path: trackingPath,
                  company_name: item.name,
                })
              }
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span
                  className={`
                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-mono shrink-0
                    ${rankStart + index <= 3 ? "bg-black text-white" : "bg-gray-100 text-gray-500"}
                  `}
                >
                  {rankStart + index}
                </span>
                <span className="font-semibold text-gray-800 truncate">{item.name}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                {renderMetricValue(item, data.metric)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
