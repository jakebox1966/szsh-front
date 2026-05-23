/**
 * 주택담보대출 (주담대) 한도 파라미터.
 *
 * 2026 기준:
 * - 규제지역 (서울 강남·서초·송파·용산 등): LTV 40%
 * - 비규제지역: LTV 70%
 * - 생애최초: LTV 80% 일괄 (한도 6억)
 * - DTI 한도는 사실상 DSR 한도로 대체된 상태지만 형식적으로 60%/50%/40% 유지
 *
 * 출처: 금융위원회 가계부채 관리방안.
 */

/** 지역 분류 */
export type RegionType = "regulated" | "regular";

export const REGION_LABELS: Record<RegionType, string> = {
  regulated: "규제지역",
  regular: "비규제지역",
};

/**
 * LTV 한도 (지역 × 생애최초 여부).
 * 생애최초는 지역 무관 80%, 한도 6억 적용.
 */
export const LTV_LIMITS: Record<RegionType, { default: number; firstHome: number }> = {
  regulated: { default: 0.40, firstHome: 0.80 },
  regular: { default: 0.70, firstHome: 0.80 },
};

/** 생애최초 대출 절대 한도 (원) — 2026 기준 6억 */
export const FIRST_HOME_MAX_LOAN = 600_000_000;

/** DTI 한도 (지역별) — 실제로는 DSR이 더 빡빡한 케이스가 많음 */
export const DTI_LIMITS: Record<RegionType, number> = {
  regulated: 0.40,
  regular: 0.60,
};

export const LOAN_TERM_OPTIONS = [10, 15, 20, 25, 30, 35, 40];
export const DEFAULT_LOAN_TERM_YEARS = 30;

/** 참고용 주담대 평균 금리 (%) — 2026 시장 상황 */
export const DEFAULT_MORTGAGE_RATE = 4.5;
