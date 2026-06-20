"use client";

import { useRef, useState } from "react";
import { DollarSign, Building2, TrendingUp, PieChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import type { HomeTag } from "../data";
import {
  NetPayCalculator,
  JeonseCalculator,
  MortgageCalculator,
  DsrCalculator,
} from "@/features/calculators";

const TAGS: HomeTag[] = [
  { id: "salary_table", label: "연봉실수령액계산기", icon: DollarSign },
  { id: "jeonse", label: "전세계산기", icon: Building2 },
  { id: "mortgage", label: "주담대 계산기", icon: TrendingUp },
  { id: "dsr", label: "DSR 계산기", icon: PieChart },
];

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
        <p className="text-sm text-muted-foreground py-4">
          이 계산기는 곧 추가될 예정입니다.
        </p>
      );
  }
}

export function CalculatorSection() {
  const [modalTag, setModalTag] = useState<HomeTag | null>(null);
  // 닫는 동안에도 내부 콘텐츠가 보이도록 마지막 modalTag 보존 (closing 애니메이션 200ms).
  const lastModalTagRef = useRef<HomeTag | null>(null);
  if (modalTag) lastModalTagRef.current = modalTag;
  const displayedTag = modalTag ?? lastModalTagRef.current;

  const openModal = (tag: HomeTag) => {
    setModalTag(tag);
    // 계산기 진입 이벤트 (로그인 시 user_id 자동 부착).
    const entryEvent =
      CALCULATOR_ENTRY_EVENTS[tag.id as keyof typeof CALCULATOR_ENTRY_EVENTS];
    if (entryEvent) trackEvent(entryEvent, {});
  };

  return (
    <section className="w-full max-w-2xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold text-foreground">금융 계산기</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          연봉·전세·주담대·DSR 한도를 빠르게 계산해보세요
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {TAGS.map((tag) => {
          const Icon = tag.icon;
          // 모달 열린 동안 트리거 비활성화 (이중 클릭 / 다른 계산기 동시 호출 방지)
          const isDisabled = !!modalTag;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => openModal(tag)}
              disabled={isDisabled}
              className="group flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md hover:shadow-indigo-500/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:bg-card disabled:hover:shadow-none"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                <Icon size={18} />
              </span>
              <span className="text-xs font-semibold text-center leading-tight text-foreground group-hover:text-indigo-700">
                {tag.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 계산기 모달 - shadcn Dialog */}
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
    </section>
  );
}
