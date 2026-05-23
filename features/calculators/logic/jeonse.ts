/**
 * 전세자금대출 계산 로직.
 *
 * 단순화 버전: 보증기관 분기 X. LTV 80% 일괄.
 *
 * - 대출 한도 = 보증금 × 80%
 * - 사용자가 슬라이더로 0 ~ 한도 사이에서 대출액 선택
 * - 월 이자 = 대출액 × 금리 / 12 (만기일시상환 가정)
 * - 대출 외 필요 금액 = 보증금 - 대출액
 */

import { JEONSE_LTV_RATIO } from "../constants/jeonse";

export type JeonseInput = {
  /** 전세보증금 (원) */
  deposit: number;
  /** 사용자가 선택한 대출액 (원) */
  loanAmount: number;
  /** 금리 (%) */
  interestRate: number;
};

export type JeonseResult = {
  /** 최대 대출 가능액 (보증금의 80%) */
  maxLoan: number;
  /** 실제 대출액 (한도 내 clamp) */
  loanAmount: number;
  /** 대출 외 필요 금액 (보증금 - 대출액) */
  ownFundsNeeded: number;
  /** 월 이자 (원) */
  monthlyInterest: number;
};

export function calculateJeonse(input: JeonseInput): JeonseResult {
  const maxLoan = Math.floor(input.deposit * JEONSE_LTV_RATIO);
  const loanAmount = Math.min(Math.max(0, input.loanAmount), maxLoan);
  const ownFundsNeeded = Math.max(0, input.deposit - loanAmount);
  const monthlyInterest = Math.floor((loanAmount * input.interestRate) / 100 / 12);

  return {
    maxLoan,
    loanAmount,
    ownFundsNeeded,
    monthlyInterest,
  };
}
