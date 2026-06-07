/**
 * 비회원(익명) 검색 일일 한도 — localStorage 기반(소프트 게이트, 가입 유도용).
 * 회원 한도(20/일)는 서버(GET /api/search)가 차감/차단하므로 여기서 다루지 않는다.
 * 비회원 키와 회원(서버) 카운터는 완전히 별개라, 가입/로그인 시 차감 없이 0/20 시작.
 */
const KEY = "szsh_quota_anon";
export const ANON_SEARCH_LIMIT = 2;

/** KST(UTC+9) 기준 오늘 날짜 YYYY-MM-DD. 자정 리셋 기준. */
function kstToday(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

type Stored = { date: string; count: number };

function read(): Stored {
  const today = kstToday();
  if (typeof window === "undefined") return { date: today, count: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Stored;
      // 저장된 날짜가 오늘과 다르면 리셋(count 0)
      if (p && p.date === today && typeof p.count === "number") return p;
    }
  } catch {
    /* 파싱 실패 → 리셋 취급 */
  }
  return { date: today, count: 0 };
}

/** 비회원 검색 1회 소비 시도. allowed=false 면 한도 초과(소비하지 않음). */
export function consumeAnonSearch(): { allowed: boolean; used: number; limit: number } {
  const cur = read();
  if (cur.count >= ANON_SEARCH_LIMIT) {
    return { allowed: false, used: cur.count, limit: ANON_SEARCH_LIMIT };
  }
  const next: Stored = { date: cur.date, count: cur.count + 1 };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 저장 실패해도 검색은 허용 */
  }
  return { allowed: true, used: next.count, limit: ANON_SEARCH_LIMIT };
}
