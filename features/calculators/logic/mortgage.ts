/**
 * 주택담보대출 계산 로직.
 *
 * 1) 가능 대출액 = min(LTV 한도, DTI 한도, 생애최초 절대한도)
 * 2) 월 상환액: 원리금균등분할상환
 */

import {
  LTV_LIMITS,
  DTI_LIMITS,
  FIRST_HOME_MAX_LOAN,
  type RegionType,
} from "../constants/mortgage";

export type MortgageInput = {
  housePrice: number;
  region: RegionType;
  firstHome: boolean;
  annualIncome: number;
  existingAnnualDebt: number;
  termYears: number;
  interestRate: number;
};

export type MortgageResult = {
  maxByLTV: number;
  maxByDTI: number;
  /** 생애최초 절대 한도 (적용 시), 아니면 null */
  maxByFirstHomeCap: number | null;
  maxLoanAmount: number;
  appliedLTV: number;
  appliedDTI: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

/** 원리금균등분할상환 월 납입액 (원) */
export function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return Math.floor(principal / months);
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.floor((principal * monthlyRate * factor) / (factor - 1));
}

function getLTVRatio(input: MortgageInput): number {
  const limits = LTV_LIMITS[input.region];
  return input.firstHome ? limits.firstHome : limits.default;
}

function getDTIRatio(input: MortgageInput): number {
  return DTI_LIMITS[input.region];
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const ltvRatio = getLTVRatio(input);
  const dtiRatio = getDTIRatio(input);

  const maxByLTV = Math.floor(input.housePrice * ltvRatio);

  const annualLimitFromDTI = input.annualIncome * dtiRatio - input.existingAnnualDebt;
  const monthlyLimitFromDTI = Math.max(0, annualLimitFromDTI / 12);
  const monthlyRate = input.interestRate / 100 / 12;
  const months = input.termYears * 12;
  let maxByDTI: number;
  if (monthlyRate === 0) {
    maxByDTI = Math.floor(monthlyLimitFromDTI * months);
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    maxByDTI = Math.floor((monthlyLimitFromDTI * (factor - 1)) / (monthlyRate * factor));
  }
  maxByDTI = Math.max(0, maxByDTI);

  const maxByFirstHomeCap = input.firstHome ? FIRST_HOME_MAX_LOAN : null;

  const candidates = [maxByLTV, maxByDTI, ...(maxByFirstHomeCap != null ? [maxByFirstHomeCap] : [])];
  const maxLoanAmount = Math.min(...candidates);

  const monthlyPayment = calcMonthlyPayment(maxLoanAmount, input.interestRate, input.termYears);
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - maxLoanAmount;

  return {
    maxByLTV,
    maxByDTI,
    maxByFirstHomeCap,
    maxLoanAmount,
    appliedLTV: ltvRatio,
    appliedDTI: dtiRatio,
    monthlyPayment,
    totalPayment,
    totalInterest,
  };
}
