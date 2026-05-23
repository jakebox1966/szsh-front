/**
 * 실수령액 계산.
 *
 * 방식:
 * - 4대보험: 정확한 요율 계산 (2026 기준)
 * - 소득세: 국세청 간이세액표 기반 lookup (회사 원천징수 방식과 일치)
 *
 * 즉 사용자의 실제 급여명세서 원천징수액과 거의 일치하게 산출.
 * 연말정산에서의 추가 환급/추가납부는 별개.
 */

import { netPayReference } from "@/features/home/data";
import {
  NATIONAL_PENSION_RATE,
  NATIONAL_PENSION_MAX_BASE,
  NATIONAL_PENSION_MIN_BASE,
  HEALTH_INSURANCE_RATE,
  LONG_TERM_CARE_RATE,
  EMPLOYMENT_INSURANCE_RATE,
  LOCAL_TAX_RATE,
  CHILD_TAX_CREDIT_MONTHLY_BY_COUNT,
  CHILD_TAX_CREDIT_PER_EXTRA,
} from "../constants/salary-2026";

export type NetPayInput = {
  /** 세전 연봉 (원) */
  annualGross: number;
  /** 부양가족 수 (본인 포함) */
  dependents: number;
  /** 8~20세 자녀 수 (세액공제 대상) */
  children: number;
  /** 월 비과세 (식대 등, 원). 기본 0 */
  monthlyNonTaxable?: number;
};

export type NetPayResult = {
  monthlyGross: number;
  monthlyNet: number;
  annualNet: number;
  deductions: {
    nationalPension: number;
    healthInsurance: number;
    longTermCare: number;
    employmentInsurance: number;
    incomeTax: number;
    localTax: number;
    total: number;
  };
};

/**
 * netPayReference (만원 단위 16구간)를 선형 보간해서
 * 주어진 연봉에 해당하는 "기본 월 실수령" 을 만원 단위로 반환.
 * 이건 부양가족 1인·자녀 0·비과세 기본 가정의 lookup.
 */
function lookupBaseMonthlyNet(annualGrossWon: number): number {
  const annualManwon = annualGrossWon / 10_000;
  const ref = netPayReference;
  if (annualManwon <= ref[0].gross) {
    // 최저 구간 이하 — 동일 비율로 추정
    return Math.floor((ref[0].net * annualManwon) / ref[0].gross);
  }
  for (let i = 0; i < ref.length - 1; i++) {
    const a = ref[i];
    const b = ref[i + 1];
    if (annualManwon <= b.gross) {
      const t = (annualManwon - a.gross) / (b.gross - a.gross);
      return Math.floor(a.net + (b.net - a.net) * t);
    }
  }
  // 최고 구간 초과 — 마지막 두 점 기울기 외삽
  const last = ref[ref.length - 1];
  const prev = ref[ref.length - 2];
  const slope = (last.net - prev.net) / (last.gross - prev.gross);
  return Math.floor(last.net + slope * (annualManwon - last.gross));
}

function getChildCreditMonthly(children: number): number {
  if (children <= 0) return 0;
  if (children <= 4) return CHILD_TAX_CREDIT_MONTHLY_BY_COUNT[children];
  return CHILD_TAX_CREDIT_MONTHLY_BY_COUNT[2] + (children - 2) * CHILD_TAX_CREDIT_PER_EXTRA;
}

export function calculateNetPay(input: NetPayInput): NetPayResult {
  const { annualGross, dependents, children } = input;
  const monthlyNonTaxable = input.monthlyNonTaxable ?? 0;

  const annualNonTaxable = monthlyNonTaxable * 12;
  const taxableAnnualGross = Math.max(0, annualGross - annualNonTaxable);
  const monthlyTaxableGross = taxableAnnualGross / 12;

  // ── 4대보험 (정확 계산) ──
  const pensionBase = Math.min(
    Math.max(monthlyTaxableGross, NATIONAL_PENSION_MIN_BASE),
    NATIONAL_PENSION_MAX_BASE,
  );
  const nationalPension = Math.floor(pensionBase * NATIONAL_PENSION_RATE);
  const healthInsurance = Math.floor(monthlyTaxableGross * HEALTH_INSURANCE_RATE);
  const longTermCare = Math.floor(healthInsurance * LONG_TERM_CARE_RATE);
  const employmentInsurance = Math.floor(monthlyTaxableGross * EMPLOYMENT_INSURANCE_RATE);

  // ── 소득세: 간이세액표 lookup 기반 역산 ──
  // netPayReference 는 (부양가족 1·자녀 0·비과세 기본) 가정의 실수령액 표.
  // 1) base lookup 으로 "기본 가정의 월 실수령" 을 구하고
  // 2) 4대보험 합계를 빼서 → 그 차이가 "기본 가정의 월 세금(소득세+지방소득세)" 추정
  // 3) 부양가족·자녀 보정을 더한다.
  const monthlyGross = Math.floor(annualGross / 12);
  const baseMonthlyNetManwon = lookupBaseMonthlyNet(annualGross);
  const baseMonthlyNet = baseMonthlyNetManwon * 10_000;
  const baseInsuranceTotal =
    nationalPension + healthInsurance + longTermCare + employmentInsurance;
  const baseTaxTotal = Math.max(0, monthlyGross - baseMonthlyNet - baseInsuranceTotal);

  // 부양가족 추가 1인당 간이세액 차감 (대략 월 11,800원 — 1인 늘 때마다 세금 감소)
  // 자녀(8~20세) 별도 세액공제는 위 CHILD_TAX_CREDIT 적용.
  const PER_DEPENDENT_TAX_REDUCTION = 11_800;
  const extraDependents = Math.max(0, dependents - 1); // 본인 외 추가 부양가족
  const childCredit = getChildCreditMonthly(children);

  const baseIncomeTax = Math.floor(baseTaxTotal / (1 + LOCAL_TAX_RATE));
  const adjustedIncomeTax = Math.max(
    0,
    baseIncomeTax - extraDependents * PER_DEPENDENT_TAX_REDUCTION - childCredit,
  );
  const monthlyIncomeTax = adjustedIncomeTax;
  const monthlyLocalTax = Math.floor(monthlyIncomeTax * LOCAL_TAX_RATE);

  const totalDeduction =
    nationalPension +
    healthInsurance +
    longTermCare +
    employmentInsurance +
    monthlyIncomeTax +
    monthlyLocalTax;

  const monthlyNet = monthlyGross - totalDeduction;
  const annualNet = monthlyNet * 12;

  return {
    monthlyGross,
    monthlyNet,
    annualNet,
    deductions: {
      nationalPension,
      healthInsurance,
      longTermCare,
      employmentInsurance,
      incomeTax: monthlyIncomeTax,
      localTax: monthlyLocalTax,
      total: totalDeduction,
    },
  };
}
