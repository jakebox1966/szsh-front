/**
 * DSR (총부채원리금상환비율) 계산 로직.
 *
 * DSR = (모든 대출의 연간 원리금 상환액) / 연소득
 *
 * 신규 대출 시 시뮬레이션: 기존 대출 + 신규 대출 → DSR 한도 비교.
 */

import {
  DSR_LIMIT_BANK,
  DSR_LIMIT_NON_BANK,
  STRESS_DSR_RATE,
  type LoanType,
} from "../constants/dsr";
import { calcMonthlyPayment } from "./mortgage";

export type ExistingLoan = {
  type: LoanType;
  /** 잔액 (원) */
  balance: number;
  /** 금리 (%) */
  rate: number;
  /** 남은 만기 (년) — null이면 DSR 산정 만기 가정 적용 */
  remainingYears: number;
  /** 변동금리 여부 (스트레스 가산 적용) */
  isVariableRate: boolean;
};

export type NewLoan = {
  type: LoanType;
  amount: number;
  rate: number;
  termYears: number;
  isVariableRate: boolean;
};

export type DsrInput = {
  /** 연소득 (원) */
  annualIncome: number;
  /** 기존 대출 목록 */
  existingLoans: ExistingLoan[];
  /** 신규 대출 (없으면 null) */
  newLoan: NewLoan | null;
  /** 제2금융권 여부 — DSR 한도 결정 */
  isNonBank: boolean;
  /** 수도권·규제지역 여부 — 스트레스 가산금리 결정 */
  isMetro: boolean;
};

export type DsrResult = {
  /** 현재 (기존만) DSR 비율 */
  currentDsr: number;
  /** 신규 포함 DSR 비율 */
  totalDsr: number;
  /** 적용 한도 */
  limit: number;
  /** 한도 내 여부 */
  withinLimit: boolean;
  /** 기존 연간 원리금 (원) */
  existingAnnualPayment: number;
  /** 신규 연간 원리금 (원) */
  newAnnualPayment: number;
  /** 추가로 더 받을 수 있는 연간 원리금 여력 (원) */
  remainingCapacity: number;
};

/** DSR 산정용 연간 원리금 — 스트레스 가산 반영 */
function annualPaymentForDsr(
  principal: number,
  rate: number,
  years: number,
  isVariable: boolean,
  stressBps: number,
): number {
  const effectiveRate = rate + (isVariable ? stressBps * 100 : 0);
  const monthly = calcMonthlyPayment(principal, effectiveRate, years);
  return monthly * 12;
}

export function calculateDsr(input: DsrInput): DsrResult {
  const stressBps = input.isMetro ? STRESS_DSR_RATE.METRO : STRESS_DSR_RATE.NON_METRO;

  const existingAnnualPayment = input.existingLoans.reduce(
    (sum, loan) =>
      sum +
      annualPaymentForDsr(
        loan.balance,
        loan.rate,
        loan.remainingYears,
        loan.isVariableRate,
        stressBps,
      ),
    0,
  );

  const newAnnualPayment = input.newLoan
    ? annualPaymentForDsr(
        input.newLoan.amount,
        input.newLoan.rate,
        input.newLoan.termYears,
        input.newLoan.isVariableRate,
        stressBps,
      )
    : 0;

  const currentDsr = input.annualIncome > 0 ? existingAnnualPayment / input.annualIncome : 0;
  const totalDsr =
    input.annualIncome > 0
      ? (existingAnnualPayment + newAnnualPayment) / input.annualIncome
      : 0;

  const limit = input.isNonBank ? DSR_LIMIT_NON_BANK : DSR_LIMIT_BANK;
  const withinLimit = totalDsr <= limit;
  const remainingCapacity = Math.max(
    0,
    input.annualIncome * limit - existingAnnualPayment - newAnnualPayment,
  );

  return {
    currentDsr,
    totalDsr,
    limit,
    withinLimit,
    existingAnnualPayment,
    newAnnualPayment,
    remainingCapacity,
  };
}
