"use client";

import { useMemo, useState } from "react";
import { Building2, TrendingUp, Activity, BarChart3 } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { FinanceMetric, SourceBadge } from "../components";
import { formatKRWCompact } from "@/lib/format";
import type { CompanyFinance, FinanceHistoryItem } from "../data";

type FinanceSectionProps = {
  finance: CompanyFinance | null;
};

type Tab = "overview" | "growth" | "margin";

function MainTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const rev = payload.find((p: any) => p.dataKey === "매출액")?.value;
  const profit = payload.find((p: any) => p.dataKey === "영업이익")?.value;
  const margin = rev && profit ? ((profit / rev) * 100).toFixed(1) : null;
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl px-3.5 py-2.5 shadow-xl border border-gray-700">
      <p className="font-bold mb-2 text-sm">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-blue-400" />
            매출액
          </span>
          <span className="font-semibold">{formatKRWCompact(rev) || "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            영업이익
          </span>
          <span className="font-semibold">{formatKRWCompact(profit) || "—"}</span>
        </div>
        {margin && (
          <div className="flex items-center justify-between gap-4 pt-1 mt-1 border-t border-gray-700">
            <span className="text-gray-400">영업이익률</span>
            <span className="font-semibold text-emerald-300">{margin}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function GrowthTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const g = payload[0].value;
  return (
    <div className="bg-gray-900/95 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      <p className={g >= 0 ? "text-red-300" : "text-blue-300"}>
        전년 대비 {g >= 0 ? "+" : ""}
        {g.toFixed(1)}%
      </p>
    </div>
  );
}

function MarginTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-gray-900/95 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      <p className="text-emerald-300">영업이익률 {payload[0].value.toFixed(1)}%</p>
    </div>
  );
}

function computeDerived(history: FinanceHistoryItem[]) {
  const growth = history.map((h, i) => {
    const prev = history[i - 1];
    const g =
      prev && prev.rev > 0 ? ((h.rev - prev.rev) / prev.rev) * 100 : null;
    return { year: h.year, 성장률: g };
  });
  const margin = history.map((h) => ({
    year: h.year,
    영업이익률: h.rev > 0 ? (h.profit / h.rev) * 100 : 0,
  }));
  return { growth, margin };
}

const TABS: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "overview", label: "매출·이익", icon: BarChart3 },
  { key: "growth", label: "성장률", icon: TrendingUp },
  { key: "margin", label: "이익률", icon: Activity },
];

export function FinanceSection({ finance }: FinanceSectionProps) {
  const [tab, setTab] = useState<Tab>("overview");

  const hasData =
    !!finance &&
    (finance.revenue.current > 0 ||
      finance.operatingProfit.current > 0 ||
      finance.netProfit.current > 0 ||
      finance.history.length > 0);

  const derived = useMemo(
    () => (finance ? computeDerived(finance.history) : null),
    [finance],
  );

  const overviewData = useMemo(
    () =>
      finance?.history.map((h) => ({
        year: h.year,
        매출액: h.rev,
        영업이익: h.profit,
      })) ?? [],
    [finance],
  );

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="text-muted-foreground" size={20} />
          재무 성장성
        </h2>
        {hasData && <SourceBadge source="DART" />}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <BarChart3 className="text-muted-foreground" size={24} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">공시된 재무 데이터가 없습니다</p>
          <p className="text-xs text-muted-foreground mt-1">
            비상장 / 외감 비대상 기업일 수 있습니다
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <FinanceMetric
              label="매출액"
              value={finance!.revenue.current}
              growth={finance!.revenue.growth}
            />
            <FinanceMetric
              label="영업이익"
              value={finance!.operatingProfit.current}
              growth={finance!.operatingProfit.growth}
            />
            <FinanceMetric
              label="당기순이익"
              value={finance!.netProfit.current}
              growth={finance!.netProfit.growth}
            />
          </div>

          {finance!.history.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 mb-4 p-1 bg-muted rounded-xl w-fit mx-auto">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      tab === key
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {tab === "overview" ? (
                    <ComposedChart
                      data={overviewData}
                      margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="revBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatKRWCompact(v)}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatKRWCompact(v)}
                      />
                      <Tooltip
                        content={<MainTooltip />}
                        cursor={{ fill: "rgba(59,130,246,0.05)" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11, color: "#6b7280", paddingTop: 8 }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="매출액"
                        fill="url(#revBar)"
                        radius={[6, 6, 0, 0]}
                        barSize={36}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="영업이익"
                        stroke="#f97316"
                        strokeWidth={2.5}
                        dot={{ fill: "#fff", stroke: "#f97316", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#f97316" }}
                      />
                    </ComposedChart>
                  ) : tab === "growth" ? (
                    <ComposedChart
                      data={derived!.growth}
                      margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        content={<GrowthTooltip />}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                      />
                      <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1} />
                      <Bar dataKey="성장률" radius={[6, 6, 6, 6]} barSize={36}>
                        {derived!.growth.map((d, i) => (
                          <Cell
                            key={i}
                            fill={
                              d.성장률 == null
                                ? "#e5e7eb"
                                : d.성장률 >= 0
                                  ? "#ef4444"
                                  : "#3b82f6"
                            }
                          />
                        ))}
                      </Bar>
                    </ComposedChart>
                  ) : (
                    <ComposedChart
                      data={derived!.margin}
                      margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="marginArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v.toFixed(0)}%`}
                      />
                      <Tooltip
                        content={<MarginTooltip />}
                        cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="영업이익률"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#marginArea)"
                        dot={{ fill: "#fff", stroke: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
