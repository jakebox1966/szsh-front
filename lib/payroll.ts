/**
 * 한국 월급여 기준 4대보험 + 소득세 근사 계산 (2024 기준).
 *
 * 정확한 실수령액 계산은 부양가족 수, 비과세 항목, 회사 별 공제 정책 등에
 * 따라 달라지므로 본 함수는 "단신·부양가족 1인" 가정의 근사치를 제공한다.
 */

export type PayrollBreakdown = {
  gross: number;            // 월 세전 (원)
  nationalPension: number;  // 국민연금 (4.5%)
  healthInsurance: number;  // 건강보험 (3.545%)
  longTermCare: number;     // 장기요양 (건강보험 × 12.95%)
  employment: number;       // 고용보험 (0.9%)
  incomeTax: number;        // 소득세 (간이세액표 근사)
  localTax: number;         // 지방소득세 (소득세 × 10%)
  totalDeduction: number;
  net: number;              // 월 세후 (원)
};

// 국민연금 표준소득월액 상한 (2024년 기준 약 590만원)
const NPS_INCOME_CAP = 5_900_000;

export function estimatePayroll(gross: number): PayrollBreakdown {
  const npsBase = Math.min(gross, NPS_INCOME_CAP);
  const nationalPension = Math.floor(npsBase * 0.045);
  const healthInsurance = Math.floor(gross * 0.03545);
  const longTermCare = Math.floor(healthInsurance * 0.1295);
  const employment = Math.floor(gross * 0.009);

  let incomeTax = 0;
  if (gross <= 1_060_000) incomeTax = 0;
  else if (gross <= 1_500_000) incomeTax = (gross - 1_060_000) * 0.06;
  else if (gross <= 3_000_000) incomeTax = 26_400 + (gross - 1_500_000) * 0.1;
  else if (gross <= 4_500_000) incomeTax = 176_400 + (gross - 3_000_000) * 0.15;
  else if (gross <= 7_000_000) incomeTax = 401_400 + (gross - 4_500_000) * 0.2;
  else if (gross <= 10_000_000) incomeTax = 901_400 + (gross - 7_000_000) * 0.25;
  else incomeTax = 1_651_400 + (gross - 10_000_000) * 0.3;
  incomeTax = Math.floor(incomeTax);
  const localTax = Math.floor(incomeTax * 0.1);

  const totalDeduction =
    nationalPension + healthInsurance + longTermCare + employment + incomeTax + localTax;
  const net = Math.max(0, gross - totalDeduction);

  return {
    gross,
    nationalPension,
    healthInsurance,
    longTermCare,
    employment,
    incomeTax,
    localTax,
    totalDeduction,
    net,
  };
}
