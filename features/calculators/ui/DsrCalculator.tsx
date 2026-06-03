"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { formatKRW } from "@/lib/format";
import { calculateDsr, type ExistingLoan } from "../logic/dsr";
import { LOAN_TYPE_LABELS, type LoanType } from "../constants/dsr";
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

type Row = ExistingLoan & { id: number };

let rowSeq = 1;
function newRow(): Row {
  return {
    id: rowSeq++,
    type: "credit",
    balance: 0,
    rate: 0,
    remainingYears: 0,
    isVariableRate: true,
  };
}

export function DsrCalculator() {
  const [annualIncome, setAnnualIncome] = useState(0);
  const [isNonBank, setIsNonBank] = useState<"bank" | "non_bank">("bank");
  const [region, setRegion] = useState<"metro" | "non_metro">("metro");
  const [loans, setLoans] = useState<Row[]>([newRow()]);
  const [hasNewLoan, setHasNewLoan] = useState<"yes" | "no">("no");
  const [newLoanAmount, setNewLoanAmount] = useState(0);
  const [newLoanRate, setNewLoanRate] = useState(0);
  const [newLoanYears, setNewLoanYears] = useState(0);
  const [newLoanType, setNewLoanType] = useState<LoanType>("mortgage");

  const { result, calculated, calculate } = useDeferredResult(
    {
      annualIncome,
      existingLoans: loans,
      newLoan:
        hasNewLoan === "yes"
          ? {
              type: newLoanType,
              amount: newLoanAmount,
              rate: newLoanRate,
              termYears: newLoanYears,
              isVariableRate: true,
            }
          : null,
      isNonBank: isNonBank === "non_bank",
      isMetro: region === "metro",
    },
    calculateDsr,
  );

  const updateRow = (id: number, patch: Partial<Row>) =>
    setLoans((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id: number) =>
    setLoans((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="연소득 (세전)" aside={<WonText won={annualIncome} />}>
          <ManwonInput value={annualIncome} onChange={setAnnualIncome} placeholder="연소득 입력" />
        </Field>
        <Field label="대출 기관">
          <SegmentedControl
            value={isNonBank}
            onChange={setIsNonBank}
            options={[
              { value: "bank", label: "은행 (40%)" },
              { value: "non_bank", label: "2금융 (50%)" },
            ]}
          />
        </Field>
        <Field label="지역 (스트레스 DSR 가산)" hint="수도권 3%p / 지방 0.75%p">
          <SegmentedControl
            value={region}
            onChange={setRegion}
            options={[
              { value: "metro", label: "수도권·규제지역" },
              { value: "non_metro", label: "지방" },
            ]}
          />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">기존 대출</span>
          <button
            type="button"
            onClick={() => setLoans((rows) => [...rows, newRow()])}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <Plus size={12} /> 추가
          </button>
        </div>
        <div className="space-y-2">
          {loans.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-gray-100 bg-white p-3 grid grid-cols-12 gap-2 items-end"
            >
              <div className="col-span-6 sm:col-span-3">
                <Field label="종류">
                  <select
                    value={row.type}
                    onChange={(e) => updateRow(row.id, { type: e.target.value as LoanType })}
                    className="w-full h-10 px-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    {(Object.keys(LOAN_TYPE_LABELS) as LoanType[]).map((t) => (
                      <option key={t} value={t}>
                        {LOAN_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Field label="잔액" aside={<WonText won={row.balance} />}>
                  <ManwonInput
                    value={row.balance}
                    onChange={(v) => updateRow(row.id, { balance: v })}
                    placeholder="잔액 입력"
                  />
                </Field>
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Field label="금리">
                  <NumberInput
                    value={row.rate}
                    onChange={(v) => updateRow(row.id, { rate: v })}
                    suffix="%"
                    step={0.1}
                  />
                </Field>
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Field label="만기">
                  <NumberInput
                    value={row.remainingYears}
                    onChange={(v) => updateRow(row.id, { remainingYears: v })}
                    suffix="년"
                    min={1}
                    max={40}
                  />
                </Field>
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={loans.length <= 1}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  aria-label="삭제"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Field label="신규 대출 시뮬레이션">
          <SegmentedControl
            value={hasNewLoan}
            onChange={setHasNewLoan}
            options={[
              { value: "no", label: "현재 DSR만" },
              { value: "yes", label: "신규 추가" },
            ]}
          />
        </Field>
        {hasNewLoan === "yes" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <Field label="종류">
              <select
                value={newLoanType}
                onChange={(e) => setNewLoanType(e.target.value as LoanType)}
                className="w-full h-11 px-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-blue-500"
              >
                {(Object.keys(LOAN_TYPE_LABELS) as LoanType[]).map((t) => (
                  <option key={t} value={t}>
                    {LOAN_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="금액" aside={<WonText won={newLoanAmount} />}>
              <ManwonInput
                value={newLoanAmount}
                onChange={setNewLoanAmount}
                placeholder="대출 금액"
              />
            </Field>
            <Field label="금리">
              <NumberInput
                value={newLoanRate}
                onChange={setNewLoanRate}
                suffix="%"
                step={0.1}
              />
            </Field>
            <Field label="만기">
              <NumberInput
                value={newLoanYears}
                onChange={setNewLoanYears}
                suffix="년"
                min={1}
                max={40}
              />
            </Field>
          </div>
        )}
      </div>

      <CalculateButton
        onClick={() => {
          trackEvent("dsr_calculate", {});
          calculate();
        }}
        disabled={annualIncome <= 0}
        label={calculated ? "다시 계산하기" : "계산하기"}
      />

      {result ? (
        <>
          <ResultCard
            title="DSR 결과"
            primaryValue={pct(result.totalDsr)}
            primaryLabel={`한도 ${pct(result.limit)}`}
            highlight={result.withinLimit ? "emerald" : "rose"}
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 border-t border-current/10">
              <BreakdownRow label="현재 DSR" value={pct(result.currentDsr)} />
              <BreakdownRow
                label={result.withinLimit ? "잔여 여력" : "초과"}
                value={result.withinLimit ? result.remainingCapacity : `-${formatKRW(-result.remainingCapacity)}`}
              />
            </div>
          </ResultCard>

          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="text-xs font-medium text-gray-500 mb-2">연간 원리금 (스트레스 가산 반영)</div>
            <div className="space-y-0.5 text-xs">
              <BreakdownRow label="기존 대출 합계" value={result.existingAnnualPayment} />
              {hasNewLoan === "yes" && (
                <BreakdownRow label="신규 대출" value={result.newAnnualPayment} />
              )}
              <BreakdownRow
                label="총 합계"
                value={result.existingAnnualPayment + result.newAnnualPayment}
                highlight
              />
            </div>
          </div>
        </>
      ) : (
        <ResultPlaceholder message="연소득과 대출 정보를 입력하고 계산하기를 눌러주세요" />
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed">
        * 2026 스트레스 DSR 3단계 적용 (수도권·규제지역 +3%p / 지방 +0.75%p). 변동금리·혼합형 대출에만 가산. 실제 은행 심사 시 만기·상환방식은 더 보수적일 수 있습니다.
      </p>
    </div>
  );
}
