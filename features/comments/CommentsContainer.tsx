"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Lock, MessageSquareQuote } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatTimeAgo } from "@/lib/api-mappers";
import type { ApiCommentFeed, ApiCommentFeedItem } from "@/lib/api-types";
import { trackEvent } from "@/lib/analytics";

function CommentRow({ c }: { c: ApiCommentFeedItem }) {
  return (
    <li className="px-4 py-4 border-b border-gray-100">
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
        {c.content}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
        <Link
          href={`/company/${c.companySlug}`}
          className="font-semibold text-indigo-500 hover:text-indigo-600"
        >
          {c.companyName}
        </Link>
        <span>·</span>
        <span>{c.nickname}</span>
        <span>·</span>
        <span>{formatTimeAgo(c.createdAt)}</span>
      </div>
    </li>
  );
}

export function CommentsContainer() {
  const [items, setItems] = useState<ApiCommentFeedItem[]>([]);
  const [locked, setLocked] = useState(false);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(async (cur: number | null) => {
    const qs = cur != null ? `?cursor=${cur}` : "";
    return apiFetch<ApiCommentFeed>(`/api/comments${qs}`);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPage(null);
        if (cancelled) return;
        setItems(data.items);
        setLocked(data.locked);
        setTotal(data.totalCount);
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch {
        /* 무시 */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || cursor == null) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(cursor);
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    } catch {
      /* 무시 */
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, loadingMore, hasMore, cursor]);

  // 무한 스크롤 (로그인 상태에서만)
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (locked) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [locked, loadMore]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-24 pb-12">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1a1a1a]">
          <MessageSquareQuote size={22} className="text-indigo-600" />
          세이 모아보기
        </h1>
        {total > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            지금까지 {total.toLocaleString()}개의 솔직 세이
          </p>
        )}
      </header>

      {loading ? (
        <ul className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="px-4 py-4 border-b border-gray-100 space-y-2 animate-pulse">
              <div className="h-3 w-11/12 rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">아직 세이가 없습니다.</p>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <ul>
            {items.map((c) => (
              <CommentRow key={c.id} c={c} />
            ))}
          </ul>

          {/* 비로그인: 블러 + 로그인 CTA 오버레이 (콘텐츠는 서버가 안 보냄) */}
          {locked && total > items.length && (
            <div className="relative">
              <ul aria-hidden className="select-none blur-[6px] opacity-60 pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="px-4 py-4 border-b border-gray-100 space-y-2">
                    <div className="h-3 w-11/12 rounded bg-gray-200" />
                    <div className="h-3 w-2/3 rounded bg-gray-200" />
                    <div className="h-2.5 w-28 rounded bg-gray-100" />
                  </li>
                ))}
              </ul>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-white/30 via-white/85 to-white px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Lock size={18} />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  로그인하면 {(total - items.length).toLocaleString()}개 세이를 모두 볼 수 있어요
                </p>
                <Link
                  href="/login?callbackUrl=/comments"
                  onClick={() => trackEvent("sign_up_start", { from_path: "comment_login" })}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Lock size={14} /> 로그인하고 전체 보기
                </Link>
              </div>
            </div>
          )}

          {/* 로그인: 무한 스크롤 sentinel */}
          {!locked && hasMore && (
            <div ref={sentinelRef} className="py-6 text-center text-xs text-gray-400">
              {loadingMore ? "불러오는 중…" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
