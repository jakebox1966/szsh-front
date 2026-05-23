/**
 * DSR (총부채원리금상환비율) 한도 파라미터.
 *
 * 출처: 금융위원회 가계부채 종합관리방안.
 * 스트레스 DSR 3단계 시행 (2025.7.1 ~).
 *
 * DSR = (모든 대출의 연간 원리금 상환액) / 연소득
 */

/** 은행권 DSR 한도 */
export const DSR_LIMIT_BANK = 0.40;
/** 제2금융권 DSR 한도 */
export const DSR_LIMIT_NON_BANK = 0.50;

/**
 * 스트레스 DSR 가산금리 (단위: 소수, 예 0.030 = 3%p).
 * 2026 기준 — 수도권·규제지역은 풀(3%p), 지방은 유예(0.75%p).
 *
 * 변동금리 / 혼합형 대출의 DSR 산정 시 실제 금리에 가산.
 */
export const STRESS_DSR_RATE = {
  /** 수도권·규제지역 주담대 (3단계 풀 적용) */
  METRO: 0.030,
  /** 지방 (2026.6.30 까지 유예) */
  NON_METRO: 0.0075,
};

export type LoanType = "mortgage" | "jeonse" | "credit" | "overdraft";

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  mortgage: "주택담보대출",
  jeonse: "전세자금대출",
  credit: "신용대출",
  overdraft: "마이너스통장",
};
