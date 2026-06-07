"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Building2, Clock, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useRecentCompanies, removeRecentCompany, clearRecentCompanies } from "@/lib/recent";
import type { ApiCompanyListItem } from "@/lib/api-types";

export function HeroSection() {
  const router = useRouter();
  const recentCompanies = useRecentCompanies();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiCompanyListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // debounce 검색
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        const data = await apiFetch<ApiCompanyListItem[]>(
          `/api/companies?q=${encodeURIComponent(trimmed)}`,
        );
        setResults(data);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    trackEvent("search_enter", {
      from_path: "home",
      keyword: trimmed,
      click_type: "search_result_page",
    });
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // 자동완성에서 회사 직접 선택 (검색 결과 페이지 안 거치는 분기)
  const goToCompany = (slug: string, name?: string) => {
    trackEvent("search_enter", {
      from_path: "home",
      keyword: query.trim(),
      click_type: "keyword_matching",
    });
    trackEvent("company_detail", {
      from_path: "keyword_matching",
      company_name: name ?? slug,
    });
    setOpen(false);
    router.push(`/company/${slug}`);
  };

  // 최근 검색 기업 칩 클릭 — 검색 아님이므로 company_detail(from_path: other)만 발사.
  const goToRecent = (slug: string, name: string) => {
    trackEvent("company_detail", { from_path: "other", company_name: name });
    router.push(`/company/${slug}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        const r = results[activeIndex];
        goToCompany(r.slug, r.name);
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showResults = open && query.trim().length > 0 && results.length > 0;
  // 포커스 + 입력 없음 + 최근 검색 있음 → 최근 검색 목록을 드롭다운으로
  const showRecent = open && query.trim().length === 0 && recentCompanies.length > 0;
  const showDropdown = showResults || showRecent;

  return (
    // animate-fade-in 사용 X — 해당 클래스는 opacity 를 애니메이션하므로
    // forwards 적용 시 stacking context 가 영구 유지되어 안쪽 dropdown z-index 가 갇힘
    <div className="text-center mb-8 w-full">
      <h1 className="mb-3">
        <span className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          szsh
        </span>
      </h1>
      <p className="mb-8 text-base md:text-lg font-semibold text-gray-700">
        취업·이직 전 연봉부터 성장성까지 기업의 데이터를 확인하세요.
      </p>

      <div className="relative group w-full max-w-2xl mx-auto mb-8" ref={wrapperRef}>
        <div className="relative bg-white rounded-full md:rounded-[2rem] shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-gray-200 p-1.5 md:p-2 flex items-center transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-gray-300">
          <div className="pl-3 pr-2 md:pl-4 md:pr-3 text-gray-400 shrink-0">
            <Search className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" strokeWidth={2} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="기업명 검색"
            className="flex-1 min-w-0 bg-transparent border-none outline-none py-2 md:py-3 text-sm md:text-lg text-gray-800 placeholder-gray-400 font-medium"
          />
          <button
            type="button"
            className="p-2 md:p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors text-white shadow-sm md:shadow-md disabled:opacity-50 shrink-0"
            onClick={submitSearch}
            disabled={!query.trim()}
            aria-label="검색"
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {showDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-[50] text-left">
            {showRecent ? (
              <>
                <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                  <span className="text-xs font-medium text-gray-400">최근 검색</span>
                  <button
                    type="button"
                    onClick={clearRecentCompanies}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    전체 삭제
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto pb-1">
                  {recentCompanies.map((c) => (
                    <li key={c.slug} className="flex items-center hover:bg-gray-50">
                      <button
                        type="button"
                        onClick={() => goToRecent(c.slug, c.name)}
                        className="flex-1 min-w-0 flex items-center gap-3 pl-4 py-2.5"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 shrink-0">
                          <Clock size={14} />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {c.name}
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecentCompany(c.slug)}
                        aria-label={`${c.name} 최근 검색에서 삭제`}
                        className="shrink-0 px-3 py-2.5 text-gray-300 hover:text-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <ul className="max-h-80 overflow-y-auto py-1">
                  {results.map((item, idx) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => goToCompany(item.slug, item.name)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          idx === activeIndex
                            ? "bg-gray-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-500 shrink-0">
                          <Building2 size={14} />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </div>
                          {(item.engName || item.industry) && (
                            <div className="text-xs text-gray-400 truncate">
                              {[item.engName, item.industry]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={submitSearch}
                  className="w-full px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors text-left"
                >
                  &ldquo;{query.trim()}&rdquo; 전체 결과 보기
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
