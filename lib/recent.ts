"use client";

import { useEffect, useState } from "react";

/**
 * "내가 최근 검색(조회)한 기업" — 기기 로컬(localStorage) 저장.
 * 전체 사용자 공유가 아니라 본인 브라우저 기준 최근 5개.
 */
const KEY = "szsh:recent-companies";
const MAX = 5;
// 같은 탭 내 구독자 알림용 (storage 이벤트는 "다른 탭"에서만 발생하므로 별도 필요)
const CHANGED_EVENT = "szsh:recent-companies-changed";

export type RecentCompany = { slug: string; name: string };

export function getRecentCompanies(): RecentCompany[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentCompany[]) : [];
    return Array.isArray(list) ? list.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

/** 최근 조회 기업 push. 같은 slug 는 중복 제거 후 맨 앞으로, 최대 5개 유지. */
export function pushRecentCompany(slug: string, name: string): void {
  if (typeof window === "undefined" || !slug || !name) return;
  const prev = getRecentCompanies().filter((c) => c.slug !== slug);
  const next = [{ slug, name }, ...prev].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* 용량 초과 등은 조용히 무시 */
  }
}

/** 특정 기업 1개 삭제. */
export function removeRecentCompany(slug: string): void {
  if (typeof window === "undefined") return;
  const next = getRecentCompanies().filter((c) => c.slug !== slug);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* 무시 */
  }
}

/** 최근 검색 전체 삭제. */
export function clearRecentCompanies(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* 무시 */
  }
}

/** 최근 조회 기업 목록 구독 훅 (같은 탭 갱신 + 다른 탭 storage 동기화). */
export function useRecentCompanies(): RecentCompany[] {
  const [list, setList] = useState<RecentCompany[]>([]);
  useEffect(() => {
    const read = () => setList(getRecentCompanies());
    read();
    window.addEventListener(CHANGED_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(CHANGED_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return list;
}
