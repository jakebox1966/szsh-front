"use client";

import { useState } from "react";

/**
 * 실시간 계산 → "계산하기 버튼" 트리거 방식으로 전환하는 훅.
 *
 * - inputs 를 직렬화해 "마지막으로 계산한 입력"과 비교한다.
 * - calculate() 를 호출하기 전이거나, 호출 후 입력이 바뀌면 result = null
 *   → UI 는 결과를 숨기고 다시 계산하도록 유도.
 *
 * 사용:
 *   const { result, calculated, calculate } = useDeferredResult(inputs, calcFn);
 *   <CalculateButton onClick={calculate} disabled={...} label={calculated ? "다시 계산하기" : "계산하기"} />
 *   {result ? <결과/> : <ResultPlaceholder .../>}
 */
export function useDeferredResult<I, R>(inputs: I, calc: (input: I) => R) {
  const key = JSON.stringify(inputs);
  const [calculatedKey, setCalculatedKey] = useState<string | null>(null);

  const calculated = calculatedKey === key;

  return {
    /** 현재 입력이 마지막 계산과 일치할 때만 결과, 아니면 null */
    result: calculated ? calc(inputs) : null,
    /** 입력이 바뀌지 않아 결과가 유효한 상태인지 */
    calculated,
    /** 현재 입력으로 계산 확정 */
    calculate: () => setCalculatedKey(key),
  };
}
