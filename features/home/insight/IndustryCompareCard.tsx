"use client";

import Link from "next/link";
import type { ApiIndustryCompare, ApiCompareCompany, ApiCompareHistoryItem } from "@/lib/api-types";
import { formatKRWCompact } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";

type Props = {
  data: ApiIndustryCompare;
};

function GrowthChip({ pct }: { pct: number | null | undefined }) {
  if (pct === null || pct === undefined) return <span className="text-[10px] text-muted-foreground">—</span>;
  const positive = pct >= 0;
  return (
    <span className={`text-[10px] font-medium tabular-nums ${positive ? "text-green-600" : "text-red-500"}`}>
      {positive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function CompanyBlock({ company }: { company: ApiCompareCompany }) {
  // 최신 연도 → 과거 순으로 정렬해서 표시
  const rows = [...company.history].sort((a, b) => (b.year || "").localeCompare(a.year || ""));

  return (
    <Link
      href={`/company/${company.slug}`}
      onClick={() =>
        trackEvent("company_detail", {
          from_path: "home_industry",
          company_name: company.name,
        })
      }
      className="block p-4 rounded-xl hover:bg-accent transition-colors cursor-pointer border border-border"
    >
      <div className="font-semibold text-foreground mb-3 truncate">{company.name}</div>

      {/* 헤더 */}
      <div className="grid grid-cols-[36px_1fr_1fr] gap-x-2 text-[10px] font-medium text-muted-foreground mb-1">
        <div>연도</div>
        <div className="text-right">매출</div>
        <div className="text-right">영업이익</div>
      </div>

      {/* 본문: 각 연도 한 줄 — 금액(상단) + 증감률(하단) 2줄 구조 */}
      <div className="space-y-1.5">
        {rows.map((h: ApiCompareHistoryItem) => (
          <div
            key={h.year}
            className="grid grid-cols-[36px_1fr_1fr] gap-x-2 items-baseline"
          >
            <div className="text-xs text-muted-foreground tabular-nums">{h.year}</div>
            <div className="text-right">
              <div className="text-xs font-semibold text-foreground tabular-nums">
                {h.revenue ? formatKRWCompact(h.revenue) : "—"}
              </div>
              <GrowthChip pct={h.revenueGrowth} />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-foreground tabular-nums">
                {h.operatingProfit != null ? formatKRWCompact(h.operatingProfit) : "—"}
              </div>
              <GrowthChip pct={h.profitGrowth} />
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}

export function IndustryCompareCard({ data }: Props) {
  if (data.items.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="mb-6">
        <span className="inline-flex items-center text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 border border-purple-100 px-2.5 py-1 rounded-full mb-2">
          오늘의 업종 비교 · {data.groupLabel}
        </span>
        <h3 className="text-lg font-bold text-foreground">매출·영업이익 5년 추이</h3>
        {data.dataAsOf && (
          <p className="text-sm text-muted-foreground mt-1">{data.dataAsOf}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.items.map((c) => (
          <CompanyBlock key={c.slug} company={c} />
        ))}
      </div>
    </div>
  );
}
