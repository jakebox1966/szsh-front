"use client";

import { useState } from "react";
import { formatKRW } from "@/lib/format";
import { calculateMortgage } from "../logic/mortgage";
import {
  REGION_LABELS,
  DEFAULT_LOAN_TERM_YEARS,
  DEFAULT_MORTGAGE_RATE,
  LOAN_TERM_OPTIONS,
  type RegionType,
} from "../constants/mortgage";
import {
  Field,
  ManwonInput,
  NumberInput,
  ResultCard,
  BreakdownRow,
  SegmentedControl,
  CalculateButton,
  ResultPlaceholder,
  WonText,
} from "./shared";
import { useDeferredResult } from "./useDeferredResult";
import { trackEvent } from "@/lib/analytics";

export function MortgageCalculator() {
  const [housePrice, setHousePrice] = useState(0);
  const [region, setRegion] = useState<RegionType>("regular");
  // (RegionType: "regulated" | "regular")
  const [firstHome, setFirstHome] = useState<"first" | "multi">("first");
  const [annualIncome, setAnnualIncome] = useState(0);
  const [existingAnnualDebt, setExistingAnnualDebt] = useState(0);
  const [termYears, setTermYears] = useState(DEFAULT_LOAN_TERM_YEARS);
  const [interestRate, setInterestRate] = useState(DEFAULT_MORTGAGE_RATE);

  const { result, calculated, calculate } = useDeferredResult(
    {
      housePrice,
      region,
      firstHome: firstHome === "first",
      annualIncome,
      existingAnnualDebt,
      termYears,
      interestRate,
    },
    calculateMortgage,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="주택 가격" aside={<WonText won={housePrice} />}>
          <ManwonInput value={housePrice} onChange={setHousePrice} placeholder="주택가격 입력" />
        </Field>
        <Field label="연소득 (세전)" aside={<WonText won={annualIncome} />}>
          <ManwonInput value={annualIncome} onChange={setAnnualIncome} placeholder="연소득 입력" />
        </Field>
        <Field label="기존 대출 연간 원리금" hint="없으면 0" aside={<WonText won={existingAnnualDebt} />}>
          <ManwonInput
            value={existingAnnualDebt}
            onChange={setExistingAnnualDebt}
            placeholder="기존 원리금"
          />
        </Field>
        <Field label="대출 금리">
          <NumberInput
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            min={0}
            max={20}
            step={0.1}
          />
        </Field>
        <Field label="대출 기간">
          <select
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          >
            {LOAN_TERM_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </Field>
        <Field label="무주택 여부">
          <SegmentedControl
            value={firstHome}
            onChange={setFirstHome}
            options={[
              { value: "first", label: "무주택·생애최초" },
              { value: "multi", label: "유주택" },
            ]}
          />
        </Field>
        <Field label="지역">
          <SegmentedControl
            value={region}
            onChange={setRegion}
            options={[
              { value: "regulated", label: REGION_LABELS.regulated },
              { value: "regular", label: REGION_LABELS.regular },
            ]}
          />
        </Field>
      </div>

      <CalculateButton
        onClick={() => {
          trackEvent("mortgage_calculate", {});
          calculate();
        }}
        disabled={housePrice <= 0 || annualIncome <= 0}
        label={calculated ? "다시 계산하기" : "계산하기"}
      />

      {result ? (
        <>
          <ResultCard
            title="대출 가능액"
            primaryValue={formatKRW(result.maxLoanAmount)}
            primaryLabel={`월 ${formatKRW(result.monthlyPayment)}`}
            highlight="blue"
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 border-t border-blue-100/50">
              <BreakdownRow
                label={`LTV ${(result.appliedLTV * 100).toFixed(0)}%`}
                value={result.maxByLTV}
              />
              <BreakdownRow
                label={`DTI ${(result.appliedDTI * 100).toFixed(0)}%`}
                value={result.maxByDTI}
              />
              {result.maxByFirstHomeCap != null && (
                <BreakdownRow label="생애최초 한도 (6억)" value={result.maxByFirstHomeCap} />
              )}
            </div>
          </ResultCard>

          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="text-xs font-medium text-gray-500 mb-2">상환 요약 ({termYears}년 원리금균등)</div>
            <div className="space-y-0.5 text-xs">
              <BreakdownRow label="월 상환액" value={result.monthlyPayment} highlight />
              <BreakdownRow label="총 상환액" value={result.totalPayment} />
              <BreakdownRow label="총 이자" value={result.totalInterest} />
            </div>
          </div>
        </>
      ) : (
        <ResultPlaceholder message="주택 가격과 연소득을 입력하고 계산하기를 눌러주세요" />
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed">
        * LTV·DTI는 정부 정책 기준 한도이며, 은행 자체 심사기준·신용도에 따라 실제 한도가 달라질 수 있습니다. DSR 한도도 추가로 확인 필요합니다.
      </p>
    </div>
  );
}
