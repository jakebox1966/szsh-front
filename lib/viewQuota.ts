/**
 * 비회원(익명) 상세페이지 일일 조회 한도 — localStorage 기반(소프트 게이트, 가입 유도용).
 * 회원 한도(20/일)는 서버(GET /api/companies/{slug})가 차감/차단하므로 여기서 다루지 않는다.
 * 비회원 키와 회원(서버) 카운터는 완전히 별개라, 가입/로그인 시 차감 없이 0/20 시작.
 *
 * ※ 검색이 아니라 "회사 상세 진입" 시점에 차감한다.
 * ※ 같은 회사(slug)는 하루 1번만 차감 — 새로고침/재진입/중복호출에도 1로 고정(distinct).
 */
const KEY = "szsh_quota_view";
export const ANON_VIEW_LIMIT = 2;

/** KST(UTC+9) 기준 오늘 날짜 YYYY-MM-DD. 자정 리셋 기준. */
function kstToday(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

type Stored = { date: string; slugs: string[] };

function read(): Stored {
  const today = kstToday();
  if (typeof window === "undefined") return { date: today, slugs: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Stored;
      // 저장된 날짜가 오늘과 다르면 리셋(빈 목록)
      if (p && p.date === today && Array.isArray(p.slugs)) return p;
    }
  } catch {
    /* 파싱 실패 → 리셋 취급 */
  }
  return { date: today, slugs: [] };
}

function write(s: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 저장 실패해도 조회는 허용 */
  }
}

/** 비회원 현재 사용량 조회(소비하지 않음, 표시용). used = 오늘 본 회사 수(distinct). */
export function peekAnonView(): { used: number; limit: number; remaining: number } {
  const cur = read();
  return {
    used: cur.slugs.length,
    limit: ANON_VIEW_LIMIT,
    remaining: Math.max(0, ANON_VIEW_LIMIT - cur.slugs.length),
  };
}

/**
 * 비회원 상세 조회 1회 소비 시도(slug 단위, idempotent).
 * - 이미 오늘 본 회사 → allowed=true(차감 없음).
 * - 처음 보는 회사 & 한도 미만 → 추가 후 allowed=true.
 * - 처음 보는 회사 & 한도 초과 → allowed=false(소비하지 않음).
 */
export function consumeAnonView(slug: string): {
  allowed: boolean;
  used: number;
  limit: number;
} {
  const cur = read();
  if (cur.slugs.includes(slug)) {
    return { allowed: true, used: cur.slugs.length, limit: ANON_VIEW_LIMIT };
  }
  if (cur.slugs.length >= ANON_VIEW_LIMIT) {
    return { allowed: false, used: cur.slugs.length, limit: ANON_VIEW_LIMIT };
  }
  const next: Stored = { date: cur.date, slugs: [...cur.slugs, slug] };
  write(next);
  return { allowed: true, used: next.slugs.length, limit: ANON_VIEW_LIMIT };
}
