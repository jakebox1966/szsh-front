"use client";

import { useState } from "react";
import { formatKRW } from "@/lib/format";
import { calculateJeonse } from "../logic/jeonse";
import { DEFAULT_JEONSE_RATE, JEONSE_LTV_RATIO } from "../constants/jeonse";
import { trackEvent } from "@/lib/analytics";
import {
  Field,
  ManwonInput,
  NumberInput,
  CalculateButton,
  ResultPlaceholder,
  WonText,
} from "./shared";

export function JeonseCalculator() {
  const [deposit, setDeposit] = useState(0);
  // null = 기본값(한도 80%) 사용. 사용자가 슬라이더를 직접 움직이면 그 값으로 고정.
  const [loanOverride, setLoanOverride] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState(DEFAULT_JEONSE_RATE);

  // 보증금·금리를 "계산하기"로 확정해야 결과/슬라이더 노출.
  // 대출액 슬라이더는 결과 탐색용이라 계산 후엔 실시간으로 월 이자 갱신.
  const committedKey = JSON.stringify({ deposit, interestRate });
  const [calculatedKey, setCalculatedKey] = useState<string | null>(null);
  const calculated = calculatedKey === committedKey;

  const maxLoan = Math.floor(deposit * JEONSE_LTV_RATIO);
  // 슬라이더 미조정 시 항상 한도(80%)가 기본. 조정 시 그 값을 한도 내로 clamp.
  const loanAmount = loanOverride === null ? maxLoan : Math.min(loanOverride, maxLoan);

  const result = calculated ? calculateJeonse({ deposit, loanAmount, interestRate }) : null;
  const sliderPct = result && maxLoan > 0 ? (result.loanAmount / maxLoan) * 100 : 0;

  const handleCalculate = () => {
    trackEvent("jeonse_calculate", {});
    setLoanOverride(null); // 매 계산마다 대출액은 한도(80%) 기본값에서 시작
    setCalculatedKey(committedKey);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="전세 보증금" aside={<WonText won={deposit} />}>
          <ManwonInput value={deposit} onChange={setDeposit} placeholder="보증금 입력" />
        </Field>
        <Field label="대출 금리" hint="시중은행 최저 ~ 평균">
          <NumberInput
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            min={0}
            max={20}
            step={0.1}
          />
        </Field>
      </div>

      <CalculateButton
        onClick={handleCalculate}
        disabled={deposit <= 0}
        label={calculated ? "다시 계산하기" : "계산하기"}
      />

      {result ? (
        <>
          {/* 대출액 슬라이더 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">대출 금액</span>
              <span className="text-sm font-semibold text-gray-900">
                최대 {formatKRW(result.maxLoan)}
              </span>
            </div>

            <div className="relative">
              <input
                type="range"
                min={0}
                max={maxLoan}
                step={Math.max(1_000_000, Math.floor(maxLoan / 100))}
                value={result.loanAmount}
                onChange={(e) => setLoanOverride(Number(e.target.value))}
                disabled={maxLoan === 0}
                className="w-full h-2 appearance-none rounded-full bg-gray-100 outline-none disabled:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) ${sliderPct}%, rgb(243 244 246) ${sliderPct}%, rgb(243 244 246) 100%)`,
                }}
              />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatKRW(result.loanAmount) || "0원"}
              </span>
              <span className="text-xs text-gray-400">
                전세 {formatKRW(deposit) || "0원"}
              </span>
            </div>
          </div>

          {/* 예상 금액 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="text-xs font-medium text-gray-500 mb-3">예상 금액을 확인해 보세요</div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">대출 외 필요 금액</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatKRW(result.ownFundsNeeded) || "0원"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">적용 금리</span>
                <span className="text-sm font-semibold text-gray-900">{interestRate}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">예상 월 이자</span>
                <span className="text-base font-bold text-emerald-600">
                  약 {formatKRW(result.monthlyInterest) || "0원"}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <ResultPlaceholder message="보증금과 금리를 입력하고 계산하기를 눌러주세요" />
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed">
        * 보증금의 80%를 일반 한도로 산정합니다. 실제 한도·금리는 보증기관·신용도·소득·상품에 따라 다를 수 있습니다. 만기일시상환 기준 월 이자입니다.
      </p>
    </div>
  );
}
