"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { ApiCompanyListItem } from "@/lib/api-types";
import type { HomeTag } from "../data";
import {
  NetPayCalculator,
  JeonseCalculator,
  MortgageCalculator,
  DsrCalculator,
} from "@/features/calculators";

// 계산기 탭 id → GA4 진입 이벤트 이름. 이 4개에 한해 진입 이벤트 발사.
const CALCULATOR_ENTRY_EVENTS = {
  salary_table: "salary_calculate",
  jeonse: "jeonse_calculate",
  mortgage: "mortgage_calculate",
  dsr: "dsr_calculate",
} as const;

const CALCULATOR_DESCRIPTIONS: Record<string, string> = {
  salary_table: "연봉 기준 월 실수령액과 4대보험·세금 공제 내역을 계산합니다.",
  jeonse: "보증금·소득·보증기관 조건으로 전세자금대출 한도와 월 부담을 계산합니다.",
  mortgage: "주택가격·지역·소득으로 LTV·DTI 한도와 월 상환액을 계산합니다.",
  dsr: "기존 대출과 신규 대출을 합산해 DSR 한도 초과 여부를 확인합니다.",
};

function renderCalculator(tagId: string) {
  switch (tagId) {
    case "salary_table":
      return <NetPayCalculator />;
    case "jeonse":
      return <JeonseCalculator />;
    case "mortgage":
      return <MortgageCalculator />;
    case "dsr":
      return <DsrCalculator />;
    default:
      return (
        <p className="text-sm text-gray-500 py-4">
          이 계산기는 곧 추가될 예정입니다.
        </p>
      );
  }
}

type HeroSectionProps = {
  tags: HomeTag[];
  activeTag: string;
  onTagChange: (label: string) => void;
};

export function HeroSection({
  tags,
  activeTag,
  onTagChange,
}: HeroSectionProps) {
  const router = useRouter();
  const [modalTag, setModalTag] = useState<HomeTag | null>(null);
  // 닫는 동안에도 내부 콘텐츠가 보이도록 마지막 modalTag 보존.
  // modalTag 가 null 이 되어도 closing 애니메이션 (200ms) 동안 이전 콘텐츠 유지.
  const lastModalTagRef = useRef<HomeTag | null>(null);
  if (modalTag) lastModalTagRef.current = modalTag;
  const displayedTag = modalTag ?? lastModalTagRef.current;
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

  const openModal = (tag: HomeTag) => {
    setModalTag(tag);
    onTagChange(tag.label);
    // 계산기 진입 이벤트 (로그인 시 user_id 자동 부착). 계산기 탭이 아니면 발사 안 함.
    const entryEvent =
      CALCULATOR_ENTRY_EVENTS[tag.id as keyof typeof CALCULATOR_ENTRY_EVENTS];
    if (entryEvent) trackEvent(entryEvent, {});
  };

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

  const showDropdown = open && query.trim().length > 0 && results.length > 0;

  return (
    // animate-fade-in 사용 X — 해당 클래스는 opacity 를 애니메이션하므로
    // forwards 적용 시 stacking context 가 영구 유지되어 안쪽 dropdown z-index 가 갇힘
    <div className="text-center mb-12 w-full">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6">
        <Sparkles size={12} />
        <span>세전세후 AI-Powered Insights</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-semibold mb-8 leading-tight text-[#1a1a1a] tracking-[-0.03em]">
        AI로 만나는 기업 리포트
      </h1>

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
            placeholder="기업명을 검색해보세요"
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
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div className="flex flex-nowrap justify-start md:justify-center gap-2 min-w-max px-2">
          {tags.map((tag) => {
            const Icon = tag.icon;
            // 모달 열린 동안 트리거 비활성화 (이중 클릭 / 다른 계산기 동시 호출 방지)
            const isDisabled = !!modalTag;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => openModal(tag)}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
              >
                <Icon size={14} />
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Modal - shadcn Dialog */}
      <Dialog
        open={!!modalTag}
        onOpenChange={(open) => {
          if (!open) setModalTag(null);
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[88vh] overflow-y-auto">
          {displayedTag && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = displayedTag.icon;
                    return <Icon size={20} className="text-primary" />;
                  })()}
                  <DialogTitle>{displayedTag.label}</DialogTitle>
                </div>
                <DialogDescription>
                  {CALCULATOR_DESCRIPTIONS[displayedTag.id] ?? ""}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">{renderCalculator(displayedTag.id)}</div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
