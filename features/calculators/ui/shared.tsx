"use client";

import { type ReactNode } from "react";
import { formatKRW } from "@/lib/format";

/** 만원 단위 입력 → 원 단위로 변환해서 onChange. 빈 문자열은 0. */
export function ManwonInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  /** 원 단위 */
  value: number;
  onChange: (won: number) => void;
  placeholder?: string;
  id?: string;
}) {
  const manwon = value === 0 ? "" : String(Math.floor(value / 10_000));
  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={manwon}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          onChange(raw === "" ? 0 : parseInt(raw, 10) * 10_000);
        }}
        placeholder={placeholder}
        className="w-full h-11 pl-3 pr-12 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
        만원
      </span>
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  suffix,
  min,
  max,
  step,
  id,
}: {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-11 pl-3 pr-10 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  id,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex w-full p-1 bg-gray-100 rounded-xl gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === opt.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ResultCard({
  title,
  primaryValue,
  primaryLabel,
  children,
  highlight = "blue",
}: {
  title: string;
  primaryValue: string;
  primaryLabel?: string;
  children?: ReactNode;
  highlight?: "blue" | "emerald" | "amber" | "rose";
}) {
  const highlightClasses = {
    blue: "from-blue-50 to-indigo-50 border-blue-100 text-blue-700",
    emerald: "from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-orange-50 border-amber-100 text-amber-700",
    rose: "from-rose-50 to-pink-50 border-rose-100 text-rose-700",
  }[highlight];

  return (
    <div className={`rounded-2xl bg-gradient-to-br border p-4 ${highlightClasses}`}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-medium opacity-80">{title}</span>
        {primaryLabel && (
          <span className="text-[11px] opacity-60">{primaryLabel}</span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight mb-3">{primaryValue}</div>
      {children && <div className="text-xs space-y-1.5">{children}</div>}
    </div>
  );
}

export function BreakdownRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 px-2 rounded-md ${
        highlight ? "bg-white/60" : ""
      }`}
    >
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${highlight ? "text-gray-900" : "text-gray-800"}`}>
        {typeof value === "number" ? formatKRW(value) : value}
      </span>
    </div>
  );
}
