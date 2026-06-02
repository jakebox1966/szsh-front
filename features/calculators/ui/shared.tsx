"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  const manwon = String(Math.floor(value / 10_000));
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
  id,
}: {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number; // 호환용으로 받기만 함 (text 입력이라 native step 미사용)
  id?: string;
}) {
  // 소수점 입력("1.3")이 controlled number 때문에 "1." 에서 잘리는 문제 방지 →
  // 로컬 문자열로 표시하고 숫자 변환은 onChange 로만 넘긴다.
  const [text, setText] = useState(() => String(value));

  // 외부에서 value 가 바뀌면 동기화. 단 "1." 처럼 파싱 결과가 같으면 타이핑 보존.
  useEffect(() => {
    if (Number(text === "" ? "0" : text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (raw: string) => {
    // 숫자·소수점만, 소수점 1개만, 앞자리 불필요한 0 제거
    let cleaned = raw.replace(/[^0-9.]/g, "");
    const dot = cleaned.indexOf(".");
    if (dot !== -1) {
      cleaned = cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, "");
    }
    cleaned = cleaned.replace(/^0+(?=\d)/, "");
    setText(cleaned);
    onChange(cleaned === "" || cleaned === "." ? 0 : Number(cleaned));
  };

  // 포커스 아웃 시 min/max 보정 + 표시 정규화
  const handleBlur = () => {
    let n = text === "" || text === "." ? 0 : Number(text);
    if (min !== undefined && n < min) n = min;
    if (max !== undefined && n > max) n = max;
    setText(String(n));
    onChange(n);
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
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
  aside,
  children,
  id,
}: {
  label: string;
  hint?: string;
  /** 라벨 줄 오른쪽 슬롯 (예: 한글 총금액). 라벨 줄 높이가 고정이라 표시 여부와 무관하게 레이아웃이 안 흔들림. */
  aside?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 min-h-[1rem]">
        <label htmlFor={id} className="text-xs font-medium text-gray-700">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

/** 만원 입력 라벨 옆에 표시할 한글 총금액. 0 이면 렌더 안 함. */
export function WonText({ won }: { won: number }) {
  if (!won) return null;
  return (
    <span className="text-[11px] font-medium text-gray-500 tabular-nums">
      {formatKRW(won)}
    </span>
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

/** 계산기 결과를 트리거하는 버튼. 입력이 유효할 때만 활성. */
export function CalculateButton({
  onClick,
  disabled,
  label = "계산하기",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded-2xl bg-gray-900 text-white text-sm font-semibold transition hover:bg-gray-800 active:scale-[0.99] disabled:opacity-40 disabled:hover:bg-gray-900"
    >
      {label}
    </button>
  );
}

/** 아직 계산 전이거나 입력이 바뀌어 결과가 없을 때 보여줄 자리표시. */
export function ResultPlaceholder({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}
