/**
 * 금액 포맷터.
 * 백엔드는 모든 금액을 원(BIGINT) 단위로 내려보내며, 표시 단위 변환은 여기서만 함.
 */

/**
 * 원 → 사람이 읽기 좋은 한글 표기.
 * 예) 75,800,000원      → "7,580만원"
 *     101,810,000원     → "1억 181만원"
 *     476,370,000원     → "4억 7,637만원"
 *     8,123,400,000,000원 → "8조 1,234억"
 *     0 또는 null       → ""
 */
export function formatKRW(
  won: number | null | undefined,
  opts: { unit?: boolean } = {},
): string {
  if (won === null || won === undefined) return "";
  const n = Math.trunc(Number(won));
  if (!Number.isFinite(n) || n === 0) return "";

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  const JO = 1_000_000_000_000;
  const EOK = 100_000_000;
  const MAN = 10_000;
  const suffix = opts.unit === false ? "" : "원";

  if (abs >= JO) {
    const jo = Math.floor(abs / JO);
    const eok = Math.floor((abs % JO) / EOK);
    return eok > 0
      ? `${sign}${jo}조 ${eok.toLocaleString()}억`
      : `${sign}${jo}조${suffix}`;
  }
  if (abs >= EOK) {
    const eok = Math.floor(abs / EOK);
    const man = Math.floor((abs % EOK) / MAN);
    return man > 0
      ? `${sign}${eok}억 ${man.toLocaleString()}만${suffix}`
      : `${sign}${eok}억${suffix}`;
  }
  if (abs >= MAN) {
    const man = Math.floor(abs / MAN);
    return `${sign}${man.toLocaleString()}만${suffix}`;
  }
  return `${sign}${abs.toLocaleString()}${suffix}`;
}

/** 차트 라벨용 짧은 표기. "8.12조" / "476.4억" / "7,580만" */
export function formatKRWCompact(won: number | null | undefined): string {
  if (won === null || won === undefined) return "";
  const n = Number(won);
  if (!Number.isFinite(n) || n === 0) return "";

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  if (abs >= 1_000_000_000_000) return `${sign}${(abs / 1_000_000_000_000).toFixed(2)}조`;
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}억`;
  if (abs >= 10_000) return `${sign}${Math.floor(abs / 10_000).toLocaleString()}만`;
  return `${sign}${abs.toLocaleString()}`;
}

/**
 * @param signed true(기본): 증감률처럼 +/− 부호를 명시 ("+5.25%" / "-0.49%").
 *               false: 단순 비율 (퇴사율 등) ("16.23%").
 */
export function formatPercent(
  pct: number | null | undefined,
  opts: { signed?: boolean } = {},
): string {
  if (pct === null || pct === undefined) return "";
  const n = Number(pct);
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  const signed = opts.signed ?? true;
  const sign = signed && rounded >= 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

export function formatCount(n: number | null | undefined, unit = "명"): string {
  if (n === null || n === undefined) return "";
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  return `${num.toLocaleString()}${unit}`;
}
