"use client";

import { useState } from "react";
import Link from "next/link";
import { ScatterChart } from "lucide-react";
import { scatterCompanies, type ScatterCompany } from "../data";

// 차트 영역 좌표 (옵션 B: 좌하단 부정 영역 자체 컷)
// 분리선(10%, 1억)이 차트 정중앙에 오도록 X/Y 범위 대칭 설정
const X_MIN = 0; // %
const X_MAX = 20; // %  (분리선 10% 가 정중앙)
const Y_MIN = 5000; // 만원
const Y_MAX = 20000; // 만원  (분리선 ~1억은 데이터 분포상 약간 위쪽이지만 시각적 균형 OK)

const PAD = { top: 20, right: 20, bottom: 36, left: 50 };
const VIEW_W = 600;
const VIEW_H = 360;
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

const CATEGORY_COLOR: Record<ScatterCompany["category"], string> = {
  large: "#185FA5", // 파랑 — 대기업
  ideal: "#3B6D11", // 초록 — 이상향
  startup: "#BA7517", // 주황 — 스타트업
};

const CATEGORY_LABEL: Record<ScatterCompany["category"], string> = {
  large: "대기업",
  ideal: "성장기업",
  startup: "스타트업",
};

function projectX(growth: number): number {
  const clamped = Math.max(X_MIN, Math.min(X_MAX, growth));
  return PAD.left + ((clamped - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
}

function projectY(salary: number): number {
  const clamped = Math.max(Y_MIN, Math.min(Y_MAX, salary));
  // Y는 위가 큰 값
  return PAD.top + (1 - (clamped - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;
}

export function GrowthSalaryScatterCard() {
  const [hovered, setHovered] = useState<string | null>(null);

  // 중앙 분리선 위치 (성장률 10%, 연봉 1억)
  const xMid = projectX(10);
  const yMid = projectY(10000);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            <ScatterChart size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a]">성장 × 연봉</h3>
            <p className="text-xs text-gray-500">우상단(성장기업)에 있는 회사를 한눈에</p>
          </div>
        </div>
      </div>

      <div className="mt-4 relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          role="img"
          aria-label="성장률과 평균 연봉 산점도"
        >
          {/* 4분면 배경 (좌하단은 X/Y 축 컷으로 차트 영역에서 제외) */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={xMid - PAD.left}
            height={yMid - PAD.top}
            fill="#E1F5EE"
            opacity={0.4}
          />
          <rect
            x={xMid}
            y={PAD.top}
            width={PAD.left + PLOT_W - xMid}
            height={yMid - PAD.top}
            fill="#EAF3DE"
            opacity={0.5}
          />
          <rect
            x={xMid}
            y={yMid}
            width={PAD.left + PLOT_W - xMid}
            height={PAD.top + PLOT_H - yMid}
            fill="#FAEEDA"
            opacity={0.45}
          />

          {/* 축 */}
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={PAD.top + PLOT_H}
            stroke="#B4B2A9"
            strokeWidth={0.8}
          />
          <line
            x1={PAD.left}
            y1={PAD.top + PLOT_H}
            x2={PAD.left + PLOT_W}
            y2={PAD.top + PLOT_H}
            stroke="#B4B2A9"
            strokeWidth={0.8}
          />

          {/* 중앙 점선 (성장률 10%, 연봉 1억) */}
          <line
            x1={xMid}
            y1={PAD.top}
            x2={xMid}
            y2={PAD.top + PLOT_H}
            stroke="#B4B2A9"
            strokeWidth={0.6}
            strokeDasharray="3 3"
          />
          <line
            x1={PAD.left}
            y1={yMid}
            x2={PAD.left + PLOT_W}
            y2={yMid}
            stroke="#B4B2A9"
            strokeWidth={0.6}
            strokeDasharray="3 3"
          />

          {/* 4분면 라벨 (회사 타입 기준 통일) */}
          <text x={PAD.left + 16} y={PAD.top + 20} fontSize={11} fill="#0F6E56" fontWeight={500}>
            대기업
          </text>
          <text x={xMid + 16} y={PAD.top + 20} fontSize={11} fill="#3B6D11" fontWeight={500}>
            성장기업
          </text>
          <text x={xMid + 16} y={yMid + 22} fontSize={11} fill="#854F0B" fontWeight={500}>
            스타트업
          </text>

          {/* Y축 눈금 */}
          <text x={PAD.left - 8} y={PAD.top + 4} fontSize={10} fill="#5F5E5A" textAnchor="end">
            2억
          </text>
          <text x={PAD.left - 8} y={yMid + 4} fontSize={10} fill="#5F5E5A" textAnchor="end">
            1억
          </text>
          <text x={PAD.left - 8} y={PAD.top + PLOT_H + 4} fontSize={10} fill="#5F5E5A" textAnchor="end">
            5천
          </text>
          <text
            x={14}
            y={PAD.top + PLOT_H / 2}
            fontSize={11}
            fill="#444441"
            transform={`rotate(-90 14 ${PAD.top + PLOT_H / 2})`}
            textAnchor="middle"
          >
            평균 연봉 (만원)
          </text>

          {/* X축 눈금 */}
          <text x={PAD.left} y={PAD.top + PLOT_H + 18} fontSize={10} fill="#5F5E5A">
            0%
          </text>
          <text
            x={xMid}
            y={PAD.top + PLOT_H + 18}
            fontSize={10}
            fill="#5F5E5A"
            textAnchor="middle"
          >
            +10%
          </text>
          <text
            x={PAD.left + PLOT_W}
            y={PAD.top + PLOT_H + 18}
            fontSize={10}
            fill="#5F5E5A"
            textAnchor="end"
          >
            +20%↑
          </text>
          <text
            x={PAD.left + PLOT_W / 2}
            y={PAD.top + PLOT_H + 32}
            fontSize={11}
            fill="#444441"
            textAnchor="middle"
          >
            인원 성장률 (전년 대비)
          </text>

          {/* 점 */}
          {scatterCompanies.map((c) => {
            const cx = projectX(c.growth);
            const cy = projectY(c.salary);
            const isHover = hovered === c.slug;
            return (
              <Link key={c.slug} href={`/company/${c.slug}`}>
                <g
                  onMouseEnter={() => setHovered(c.slug)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHover ? 7 : 4.5}
                    fill={CATEGORY_COLOR[c.category]}
                    fillOpacity={isHover ? 1 : 0.85}
                    stroke={isHover ? "#fff" : "transparent"}
                    strokeWidth={isHover ? 2 : 0}
                  />
                  {isHover && (
                    <g>
                      <rect
                        x={cx + 10}
                        y={cy - 22}
                        width={Math.max(70, c.name.length * 11 + 20)}
                        height={20}
                        rx={4}
                        fill="#1a1a1a"
                      />
                      <text
                        x={cx + 20}
                        y={cy - 8}
                        fontSize={11}
                        fill="#fff"
                        fontWeight={500}
                      >
                        {c.name}
                      </text>
                    </g>
                  )}
                </g>
              </Link>
            );
          })}
        </svg>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
        {(Object.keys(CATEGORY_LABEL) as Array<ScatterCompany["category"]>).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: CATEGORY_COLOR[k] }}
            />
            {CATEGORY_LABEL[k]}
          </span>
        ))}
        <span className="text-gray-400 ml-auto">점 클릭 시 회사 상세로 이동</span>
      </div>
    </div>
  );
}
