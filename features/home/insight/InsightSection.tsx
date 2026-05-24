"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { mapEmployeeGrowth } from "@/lib/api-mappers";
import type {
  ApiEmployeeGrowthItem,
  ApiSpotlight,
  ApiIndustryCompare,
  ApiCompanyOfDay,
} from "@/lib/api-types";
import { employeeGrowth as fallbackEmployeeGrowth } from "../data";
import { RevealOnView } from "@/components/ui/RevealOnView";
import { SpotlightCard } from "./SpotlightCard";
import { IndustryCompareCard } from "./IndustryCompareCard";
import { CompanyOfDayCard } from "./CompanyOfDayCard";

type HomeData = {
  employeeGrowth: { name: string; count: string; growth: string }[];
  companyOfDay: ApiCompanyOfDay | null;
  compare: ApiIndustryCompare | null;
  spotlightRevenue: ApiSpotlight | null;
  spotlightSalary: ApiSpotlight | null;
};

export function InsightSection() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        // 기획 4구좌:
        //  1) companyOfDay   → /company-of-day (매일 매출 큰 회사 1개)
        //  2) compare        → /industry-compare (오늘 분야 1위~N위 5년 추이)
        //  3) spotlightRevenue → /spotlight?metric=revenue (오늘 분야 매출 TOP 10)
        //  4) spotlightSalary  → /spotlight?metric=salary (오늘 분야 평균연봉 TOP 10)
        const [growthRes, codRes, compareRes, revRes, salRes] = await Promise.allSettled([
          apiFetch<ApiEmployeeGrowthItem[]>("/api/home/employee-growth"),
          apiFetch<ApiCompanyOfDay>("/api/home/company-of-day"),
          apiFetch<ApiIndustryCompare>("/api/home/industry-compare"),
          apiFetch<ApiSpotlight>("/api/home/spotlight?metric=revenue&limit=5"),
          apiFetch<ApiSpotlight>("/api/home/spotlight?metric=salary&limit=5"),
        ]);

        if (cancelled) return;

        setData({
          employeeGrowth:
            growthRes.status === "fulfilled"
              ? mapEmployeeGrowth(growthRes.value)
              : [...fallbackEmployeeGrowth],
          companyOfDay: codRes.status === "fulfilled" ? codRes.value : null,
          compare: compareRes.status === "fulfilled" ? compareRes.value : null,
          spotlightRevenue: revRes.status === "fulfilled" ? revRes.value : null,
          spotlightSalary: salRes.status === "fulfilled" ? salRes.value : null,
        });
      } catch {
        if (cancelled) return;
        setData({
          employeeGrowth: [...fallbackEmployeeGrowth],
          companyOfDay: null,
          compare: null,
          spotlightRevenue: null,
          spotlightSalary: null,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] animate-pulse"
          >
            <div className="h-6 bg-gray-100 rounded w-48 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-gray-50 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayData = data!;

  return (
    <div className="w-full max-w-2xl flex flex-col gap-8">
      {/* 구좌 1: 1일 1컴퍼니 */}
      {displayData.companyOfDay && (
        <RevealOnView>
          <CompanyOfDayCard data={displayData.companyOfDay} />
        </RevealOnView>
      )}
      {/* 구좌 2: 기업실적 트렌드 (산업군 1위 회사들 5년 추이) */}
      {displayData.compare && displayData.compare.items.length > 0 && (
        <RevealOnView>
          <IndustryCompareCard data={displayData.compare} />
        </RevealOnView>
      )}
      {/* 구좌 3: 매출 TOP (산업군 로테이션) */}
      {displayData.spotlightRevenue && displayData.spotlightRevenue.items.length > 0 && (
        <RevealOnView>
          <SpotlightCard data={displayData.spotlightRevenue} />
        </RevealOnView>
      )}
      {/* 구좌 4: 평균연봉 TOP (산업군 로테이션) */}
      {displayData.spotlightSalary && displayData.spotlightSalary.items.length > 0 && (
        <RevealOnView>
          <SpotlightCard data={displayData.spotlightSalary} />
        </RevealOnView>
      )}
    </div>
  );
}
