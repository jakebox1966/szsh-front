"use client";

import { useMemo, useState } from "react";
import { formatKRW } from "@/lib/format";
import { calculateNetPay } from "../logic/net-pay";
import { Field, ManwonInput, NumberInput, ResultCard, BreakdownRow } from "./shared";

export function NetPayCalculator() {
  const [annualGross, setAnnualGross] = useState(0);
  // 본인 1명 기본 (min=1) — 0 이면 간이세액표 lookup 결과가 음수 나옴
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [monthlyNonTaxable, setMonthlyNonTaxable] = useState(0);

  // 연봉 미입력 (0) 시 결과 0 으로 표시. 그 외엔 정상 계산.
  const result = useMemo(() => {
    if (annualGross <= 0) {
      return {
        monthlyNet: 0,
        annualNet: 0,
        monthlyGross: 0,
        deductions: {
          total: 0,
          nationalPension: 0,
          healthInsurance: 0,
          longTermCare: 0,
          employmentInsurance: 0,
          incomeTax: 0,
          localTax: 0,
        },
      };
    }
    return calculateNetPay({ annualGross, dependents, children, monthlyNonTaxable });
  }, [annualGross, dependents, children, monthlyNonTaxable]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="세전 연봉" hint="연 단위로 입력 (만원)">
          <ManwonInput value={annualGross} onChange={setAnnualGross} placeholder="연봉 입력" />
        </Field>
        <Field label="비과세 (월 식대 등)">
          <ManwonInput
            value={monthlyNonTaxable}
            onChange={setMonthlyNonTaxable}
            placeholder="월 비과세 금액"
          />
        </Field>
        <Field label="부양가족 수" hint="본인 포함, 배우자·자녀·부모">
          <NumberInput value={dependents} onChange={setDependents} suffix="명" min={1} max={10} />
        </Field>
        <Field label="8~20세 자녀 수" hint="세액공제 대상">
          <NumberInput value={children} onChange={setChildren} suffix="명" min={0} max={10} />
        </Field>
      </div>

      <ResultCard
        title="월 실수령액"
        primaryValue={formatKRW(result.monthlyNet)}
        primaryLabel={`연 ${formatKRW(result.annualNet)}`}
        highlight="blue"
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 border-t border-blue-100/50">
          <BreakdownRow label="월 세전" value={result.monthlyGross} />
          <BreakdownRow label="총 공제" value={`-${formatKRW(result.deductions.total)}`} />
        </div>
      </ResultCard>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="text-xs font-medium text-gray-500 mb-2">월 공제 내역</div>
        <div className="space-y-0.5 text-xs">
          <BreakdownRow label="국민연금 (4.5%)" value={result.deductions.nationalPension} />
          <BreakdownRow label="건강보험 (3.595%)" value={result.deductions.healthInsurance} />
          <BreakdownRow label="장기요양 (건보의 13.14%)" value={result.deductions.longTermCare} />
          <BreakdownRow label="고용보험 (0.9%)" value={result.deductions.employmentInsurance} />
          <BreakdownRow label="소득세 (간이세액)" value={result.deductions.incomeTax} />
          <BreakdownRow label="지방소득세 (소득세의 10%)" value={result.deductions.localTax} />
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        * 2026년 4대보험 요율 + 국세청 간이세액표(2026.3.1 시행) 기준입니다. 회사의 원천징수와 거의 일치하지만, 비과세 항목·연말정산 결과는 별개입니다.
      </p>
    </div>
  );
}
