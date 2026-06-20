"use client";

import { Users } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SourceBadge } from "../components";
import type { CompanyHR } from "../data";

type HRAnalysisSectionProps = {
  hr: CompanyHR;
  // 옛 인터페이스 유지 — 새 KPI 못 받으면 fallback 표시용
  turnoverRate?: string;
};

type ChartRow = {
  month: string;       // "2026-01" 같은 라벨
  근무인원수: number | null;
  입사자: number;
  퇴사자: number;
};

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("ko-KR");
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const headcount = payload.find((p: any) => p.dataKey === "근무인원수")?.value;
  const incoming = payload.find((p: any) => p.dataKey === "입사자")?.value;
  const outgoing = payload.find((p: any) => p.dataKey === "퇴사자")?.value;

  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-bold mb-1.5">{label}</p>
      <p className="mb-0.5">근무 인원수: {formatNumber(headcount)}명</p>
      <p className="mb-0.5">입사자: {formatNumber(incoming)}명</p>
      <p>퇴사자: {formatNumber(outgoing)}명</p>
    </div>
  );
}

export function HRAnalysisSection({ hr, turnoverRate }: HRAnalysisSectionProps) {
  const data: ChartRow[] = (hr.trends ?? []).map((t) => ({
    month: t.month,
    근무인원수: t.subscribers ?? null,
    입사자: t.in,
    퇴사자: t.out,
  }));

  // 최신월 라벨 ("2026-03" → "3월")
  const latestMonthNum = hr.latestMonth?.split("-")[1] ?? "";
  const latestMonthLabel = latestMonthNum ? `${parseInt(latestMonthNum, 10)}월` : "최근";

  // 연간 퇴사율: API 값 우선, 없으면 옛 turnoverRate 표시
  const turnoverLabel =
    hr.annualTurnover != null
      ? `${hr.annualTurnover.toFixed(1)}%`
      : (turnoverRate ?? "—");

  // 업데이트일: 최신 데이터 월 + 1개월 말일 가정 (실데이터 없을 시 fallback)
  const updateLabel = hr.latestMonth ? `최신 데이터 ${hr.latestMonth}` : "";

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="text-muted-foreground" size={20} />
            고용 현황
          </h2>
          {data.length > 0 && <SourceBadge source="NPS" />}
        </div>
        {updateLabel && (
          <p className="text-xs text-muted-foreground mt-1">{updateLabel}</p>
        )}
      </div>

      {/* KPI 4개 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{latestMonthLabel} 근무 인원수</p>
          <p className="text-2xl font-bold text-foreground">
            {formatNumber(hr.monthlyHeadcount ?? hr.current)}<span className="text-base font-normal text-muted-foreground ml-0.5">명</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{latestMonthLabel} 입사자 수</p>
          <p className="text-2xl font-bold text-foreground">
            {formatNumber(hr.monthlyIn)}<span className="text-base font-normal text-muted-foreground ml-0.5">명</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{latestMonthLabel} 퇴사자 수</p>
          <p className="text-2xl font-bold text-foreground">
            {formatNumber(hr.monthlyOut)}<span className="text-base font-normal text-muted-foreground ml-0.5">명</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">연간 퇴사율</p>
          <p className="text-2xl font-bold text-foreground">{turnoverLabel}</p>
        </div>
      </div>

      {/* 콤보 차트 */}
      {data.length > 0 ? (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 45, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="left"
                label={{ value: "근무 인원수", angle: 0, position: "insideTopLeft", fontSize: 11, fill: "#9ca3af", dy: -32 }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "입/퇴사자", angle: 0, position: "insideTopRight", fontSize: 11, fill: "#9ca3af", dy: -32 }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: "#6b7280", paddingTop: 10 }}
              />
              <Bar yAxisId="right" dataKey="입사자" fill="#10b981" radius={[2, 2, 0, 0]} barSize={10} />
              <Bar yAxisId="right" dataKey="퇴사자" fill="#d1d5db" radius={[2, 2, 0, 0]} barSize={10} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="근무인원수"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#fff", stroke: "#6366f1", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-12">월별 데이터 없음</p>
      )}
    </div>
  );
}
