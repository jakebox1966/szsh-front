"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { ApiCompanyListItem } from "@/lib/api-types";

type SearchResultsContainerProps = {
  query: string;
};

export function SearchResultsContainer({ query }: SearchResultsContainerProps) {
  const [results, setResults] = useState<ApiCompanyListItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    // 검색은 한도 차감하지 않는다(일일 한도는 상세 진입에서만 차감).
    async function fetchResults() {
      try {
        const data = await apiFetch<ApiCompanyListItem[]>(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        if (!cancelled) {
          setResults(data);
          trackEvent("search_results", {
            keyword: query,
            results_count: data.length,
          });
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Search size={14} />
          <span>검색 결과</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">
          &ldquo;{query}&rdquo;
        </h1>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-400 mb-4">
            <Search size={20} />
          </div>
          <p className="text-gray-700 font-medium mb-1">
            찾으시는 기업이 없습니다.
          </p>
          <p className="text-gray-400 text-sm">
            다른 검색어로 시도해보세요.
          </p>
        </div>
      )}

      {!loading && results && results.length > 0 && (
        <div className="space-y-2">
          {results.map((item) => (
            <Link
              key={item.slug}
              href={`/company/${item.slug}`}
              onClick={() =>
                trackEvent("company_detail", {
                  from_path: "search_result_page",
                  company_name: item.name,
                })
              }
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-500 shrink-0">
                <Building2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                  <span className="truncate">{item.name}</span>
                  {item.isListed === false && (
                    <span className="shrink-0 text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
                      비상장
                    </span>
                  )}
                </div>
                {(item.engName || item.industry) && (
                  <div className="text-xs text-gray-400 truncate">
                    {[item.engName, item.industry].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
