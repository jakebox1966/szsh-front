"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiCompanyOfDay } from "@/lib/api-types";
import { formatKRWCompact, formatPercent } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";

type Props = {
  data: ApiCompanyOfDay;
};

/** 막대 1개. 매출/영업이익 색상 분리. 호버 시 수치 툴팁 노출. */
function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((Math.abs(value) / max) * 100)) : 2;
  return (
    <div className="relative group/bar h-full flex items-end">
      <div
        className={`w-3 rounded-t-sm ${color} cursor-pointer transition-opacity hover:opacity-80`}
        style={{ height: `${pct}%` }}
        aria-label={`${label}: ${formatKRWCompact(value)}`}
      />
      {/* 호버 툴팁 */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity z-10 font-medium">
        {label}: {formatKRWCompact(value)}
      </div>
    </div>
  );
}

export function CompanyOfDayCard({ data }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      // 4px 여유 — 서브픽셀 잔차로 무한 토글되는 거 방지
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [data.history]);

  if (data.history.length === 0) return null;

  // 절대값 max로 막대 스케일 정규화 (매출 vs 영업이익 같은 축)
  const max = Math.max(
    ...data.history.flatMap((h) => [h.revenue ?? 0, h.operatingProfit ?? 0].map((v) => Math.abs(v ?? 0))),
  );
  const latestYear = data.history[data.history.length - 1]?.year;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* 카드 상단 라벨 라인 */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
          1일 1컴퍼니
        </span>
        <Link
          href={`/company/${data.slug}`}
          onClick={() =>
            trackEvent("company_detail", {
              from_path: "home_1day_1company",
              company_name: data.name,
            })
          }
          className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-0.5"
        >
          더보기 <ChevronRight size={14} />
        </Link>
      </div>

      {/* 회사 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <Building2 size={22} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#1a1a1a] leading-tight truncate">{data.name}</h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {[data.market && data.stockCode ? `${data.market} ${data.stockCode}` : null, data.industry]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      {/* 막대그래프: 5년치, 막대 2개씩 (매출/영업이익) */}
      <div className="mt-4 mb-4 relative">
        <div className="flex items-end justify-around h-32 border-b border-gray-100 px-2">
          {data.history.map((h) => (
            <div key={h.year} className="flex flex-col items-center gap-1 h-full justify-end">
              <div className="flex items-end gap-1 h-full">
                <Bar value={h.revenue ?? 0} max={max} color="bg-indigo-200" label={`${h.year} 매출`} />
                <Bar value={h.operatingProfit ?? 0} max={max} color="bg-indigo-500" label={`${h.year} 영업이익`} />
              </div>
              <div className={`text-[10px] mt-1 ${h.year === latestYear ? "font-bold text-gray-900" : "text-gray-400"}`}>
                {h.year}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 mt-2 text-[10px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-indigo-200 rounded-sm" /> 매출
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-indigo-500 rounded-sm" /> 영업이익
          </span>
        </div>
      </div>

      {/* 표 (가로 스크롤, 모바일에서 좌/우 스크롤 가능 방향으로만 힌트 화살표 노출) */}
      <div className="relative">
        <div ref={scrollRef} className="bg-gray-50 rounded-xl p-3 overflow-x-auto">
          <div className="grid grid-cols-[auto_repeat(5,auto)] gap-x-5 text-[11px] whitespace-nowrap min-w-max">
            <div className="text-gray-400">구분</div>
            {data.history.map((h) => (
              <div key={h.year} className={`text-right ${h.year === latestYear ? "font-bold text-gray-900" : "text-gray-400"}`}>
                {h.year}
              </div>
            ))}
            <div className="text-gray-500 pt-1.5">매출액</div>
            {data.history.map((h) => (
              <div
                key={h.year}
                className={`text-right pt-1.5 tabular-nums ${h.year === latestYear ? "font-bold text-indigo-700" : "text-gray-700"}`}
              >
                {h.revenue ? formatKRWCompact(h.revenue) : "—"}
              </div>
            ))}
            <div className="text-gray-500 pt-1">영업이익</div>
            {data.history.map((h) => (
              <div
                key={h.year}
                className={`text-right pt-1 tabular-nums ${h.year === latestYear ? "font-bold text-indigo-700" : "text-gray-700"}`}
              >
                {h.operatingProfit != null ? formatKRWCompact(h.operatingProfit) : "—"}
              </div>
            ))}
          </div>
        </div>
        {/* 스크롤 힌트: 모바일에서만 노출. 스크롤 가능한 방향으로만 보이며 부드럽게 페이드. pointer-events-none */}
        <div
          className={`pointer-events-none absolute top-0 left-0 h-full w-10 rounded-l-xl bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent flex items-center justify-start pl-1.5 md:hidden transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronLeft size={16} className="text-gray-400/70" />
        </div>
        <div
          className={`pointer-events-none absolute top-0 right-0 h-full w-10 rounded-r-xl bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent flex items-center justify-end pr-1.5 md:hidden transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronRight size={16} className="text-gray-400/70" />
        </div>
      </div>

      {/* 핵심 지표 박스 */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-white border border-gray-100 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">영업이익률</div>
          <div className={`text-base font-bold mt-0.5 tabular-nums ${
            data.operatingMargin == null ? "text-gray-400"
              : data.operatingMargin >= 0 ? "text-indigo-700" : "text-red-500"
          }`}>
            {data.operatingMargin != null ? formatPercent(data.operatingMargin, { signed: false }) : "—"}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">1인당 생산성</div>
          <div className="text-base font-bold mt-0.5 tabular-nums text-indigo-700">
            {data.revenuePerEmployee ? formatKRWCompact(data.revenuePerEmployee) : "—"}
          </div>
        </div>
      </div>

      {data.dataAsOf && (
        <p className="text-[10px] text-gray-400 mt-3 text-right">{data.dataAsOf}</p>
      )}
    </div>
  );
}
