"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ApiSpotlight } from "@/lib/api-types";
import { formatKRW, formatPercent } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";

type SpotlightCardProps = {
  data: ApiSpotlight;
};

const PAGE_SIZE = 5;
const AUTO_MS = 5000; // 5초마다 다음 슬라이드
const DRAG_THRESHOLD = 50; // px 이상 밀면 페이지 넘김

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
  const [page, setPage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragDx, setDragDx] = useState(0);
  const startXRef = useRef(0);
  const movedRef = useRef(false); // 드래그로 움직였으면 클릭(네비) 무시용

  const empty = data.items.length === 0;

  // 1~20위를 5개씩 슬라이드
  const pages: ApiSpotlight["items"][] = [];
  for (let i = 0; i < data.items.length; i += PAGE_SIZE) {
    pages.push(data.items.slice(i, i + PAGE_SIZE));
  }
  const totalPages = pages.length;
  const safePage = Math.min(page, Math.max(0, totalPages - 1));

  // 자동 넘김: 5초마다 다음, 마지막 → 처음 루프. 드래그 중엔 멈춤.
  // page 가 deps 라 수동 조작/자동 모두 타이머를 5초로 리셋.
  useEffect(() => {
    if (totalPages <= 1 || dragging) return;
    const id = setTimeout(() => setPage((p) => (p + 1) % totalPages), AUTO_MS);
    return () => clearTimeout(id);
  }, [page, totalPages, dragging]);

  const trackingPath: "home_field_revenue" | "home_field_salary" =
    data.metric === "salary" ? "home_field_salary" : "home_field_revenue";

  const onPointerDown = (e: React.PointerEvent) => {
    if (totalPages <= 1) return;
    startXRef.current = e.clientX;
    movedRef.current = false;
    setDragging(true);
    setDragDx(0);
    // ※ 여기서 setPointerCapture 하면 안 됨 — 캡처 중엔 click 이 컨테이너로 retarget 돼
    //   안쪽 <Link> 네비게이션이 안 먹음(순수 클릭도 막힘). 실제 드래그 시작 시에만 캡처.
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startXRef.current;
    if (!movedRef.current && Math.abs(dx) > 5) {
      movedRef.current = true; // 드래그로 확정된 순간에만 포인터 캡처(클릭은 영향 없음)
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // 일부 환경에서 throw — 무시(드래그는 그대로 동작)
      }
    }
    setDragDx(dx);
  };
  const endDrag = () => {
    if (!dragging) return;
    if (dragDx <= -DRAG_THRESHOLD) setPage((p) => Math.min(p + 1, totalPages - 1));
    else if (dragDx >= DRAG_THRESHOLD) setPage((p) => Math.max(p - 1, 0));
    setDragging(false);
    setDragDx(0);
  };
  // 드래그였으면 행 클릭(네비게이션) 막기
  const onClickCapture = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="mb-6">
        <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full mb-2">
          오늘의 분야 · {data.groupLabel}
        </span>
        <h3 className="text-lg font-bold text-[#1a1a1a]">{data.metricLabel}</h3>
        {data.dataAsOf && <p className="text-sm text-gray-500 mt-1">{data.dataAsOf}</p>}
      </div>

      {empty ? (
        <p className="text-sm text-gray-400 text-center py-8">데이터가 없습니다.</p>
      ) : (
        <>
          {/* 슬라이드 영역 — 마우스/터치로 밀어서 넘김 */}
          <div
            className={`overflow-hidden touch-pan-y select-none ${
              totalPages > 1 ? "cursor-grab active:cursor-grabbing" : ""
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
          >
            <div
              className="flex"
              style={{
                transform: `translateX(calc(${-safePage * 100}% + ${dragging ? dragDx : 0}px))`,
                transition: dragging ? "none" : "transform 0.4s ease-out",
              }}
            >
              {pages.map((pageItems, pIdx) => (
                <div key={pIdx} className="w-full shrink-0 space-y-1">
                  {pageItems.map((item, i) => {
                    const rank = pIdx * PAGE_SIZE + i + 1;
                    return (
                      <Link
                        key={item.slug}
                        href={`/company/${item.slug}`}
                        draggable={false}
                        onClick={() =>
                          trackEvent("company_detail", {
                            from_path: trackingPath,
                            company_name: item.name,
                          })
                        }
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-mono shrink-0 ${
                              rank <= 3 ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {rank}
                          </span>
                          <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          {renderMetricValue(item, data.metric)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 인디케이터 (항상 노출) */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  aria-label={`${i * PAGE_SIZE + 1}~${i * PAGE_SIZE + PAGE_SIZE}위`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === safePage ? "w-4 bg-blue-600" : "w-1.5 bg-gray-200 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
