"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";

/**
 * 글로벌 최신 검색어 (전체 사용자).
 * - recordSearchTerm: 검색 실행 시 fire-and-forget 기록
 * - useRecentSearchTerms: 최신순 목록 조회
 */
export async function recordSearchTerm(keyword: string): Promise<void> {
  const kw = keyword.trim();
  if (kw.length < 2) return;
  try {
    await apiFetch("/api/search-terms", {
      method: "POST",
      body: JSON.stringify({ keyword: kw }),
    });
  } catch {
    /* fire-and-forget — 실패해도 검색 흐름엔 영향 없음 */
  }
}

export function useRecentSearchTerms(limit = 10): string[] {
  const [terms, setTerms] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    apiFetch<{ keyword: string }[]>(`/api/search-terms/recent?limit=${limit}`)
      .then((rows) => {
        if (!cancelled) setTerms(rows.map((r) => r.keyword));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [limit]);
  return terms;
}
