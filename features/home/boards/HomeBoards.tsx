"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Lock, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ApiCommentFeed } from "@/lib/api-types";
import { useAuth } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";

// 비로그인 잠금 영역을 채울 가짜 블러 행 (실제 행과 동일 마크업)
const BLUR_ROWS = [
  { content: "복지는 괜찮은데 연봉 인상률이 좀 아쉬워요", company: "○○○○" },
  { content: "면접 분위기는 편했고 실무 위주로 물어봤어요", company: "○○○○" },
  { content: "워라밸은 팀바이팀, 야근은 거의 없는 편이에요", company: "○○○○" },
  { content: "성과급 편차가 커서 부서를 잘 봐야 합니다", company: "○○○○" },
  { content: "수평적이라곤 하지만 결국 리더 성향 영향이 큼", company: "○○○○" },
  { content: "교육·세미나 지원은 업계 평균 이상입니다", company: "○○○○" },
  { content: "조직개편이 잦아서 적응이 좀 필요했어요", company: "○○○○" },
  { content: "네임밸류 대비 보상은 무난한 수준이에요", company: "○○○○" },
  { content: "재택 병행 가능하고 장비 지원도 좋아요", company: "○○○○" },
];

// 최근 조회 기업 1건: 기록 검색어(keyword) + 매칭된 정식명(name)·slug(있으면 바로 상세이동)
type RecentCompanyItem = { keyword: string; name: string; slug: string | null };

// 아바타 색 팔레트 (목업처럼 선명한 브랜드 톤). 이름 해시로 결정 → 회사마다 색 고정.
const AVATAR_COLORS = [
  "#F97316", "#2563EB", "#14B8A6", "#F43F5E", "#7C3AED",
  "#10B981", "#F59E0B", "#4F46E5", "#EC4899", "#0EA5E9",
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// 아바타 이니셜: 앞의 법인키워드/괄호 건너뛰고 첫 글자.
function avatarInitial(name: string): string {
  const cleaned = (name || "")
    .replace(/^\s*(\(주\)|\(유\)|\(재\)|\(사\)|㈜|주식회사|유한회사)\s*/, "")
    .trim();
  return ((cleaned || name).charAt(0) || "?").toUpperCase();
}

/**
 * 홈 검색창 아래 2분할 보드.
 * - 좌: 실시간 검색어 (글로벌, 새로고침)
 * - 우: 최신 댓글 (회사명 + 스니펫, 총 건수). 비로그인은 1개 + 블러/로그인 게이트.
 */
export function HomeBoards() {
  const router = useRouter();
  const { status } = useAuth();
  const isAuthed = status === "authenticated";

  const [terms, setTerms] = useState<RecentCompanyItem[]>([]);
  const [feed, setFeed] = useState<ApiCommentFeed | null>(null);

  const loadTerms = useCallback(() => {
    apiFetch<RecentCompanyItem[]>("/api/search-terms/recent?limit=10")
      .then(setTerms)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  // 댓글 피드는 auth-aware(비로그인 1개+locked / 로그인 최대 10) → 로그인 상태 바뀌면 재요청
  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;
    apiFetch<ApiCommentFeed>("/api/comments?limit=10")
      .then((d) => {
        if (!cancelled) setFeed(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

  const comments = feed?.items ?? [];
  const totalComments = feed?.totalCount ?? 0;
  const locked = feed?.locked ?? !isAuthed;
  const hasMoreComments = totalComments > comments.length;

  const goSearch = (t: string) => {
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };
  const goCompany = (slug: string, name: string) => {
    trackEvent("company_detail", { from_path: "other", company_name: name });
    router.push(`/company/${slug}`);
  };

  // 둘 다 비어있으면 섹션 자체 숨김
  if (terms.length === 0 && comments.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
      {/* 실시간 검색어 */}
      <div className="h-full rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">최근 조회 기업</h3>
          <button
            type="button"
            onClick={loadTerms}
            aria-label="새로고침"
            className="text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        {terms.length === 0 ? (
          <p className="py-5 text-center text-xs text-gray-400">아직 검색 기록이 없어요</p>
        ) : (
          <ol className="space-y-2">
            {terms.map((t, i) => (
              <li key={t.slug ?? t.keyword}>
                <button
                  type="button"
                  onClick={() =>
                    t.slug ? goCompany(t.slug, t.name) : goSearch(t.keyword)
                  }
                  className="group flex w-full items-center gap-2.5 text-left"
                >
                  <span className="w-4 shrink-0 text-xs font-bold text-indigo-500">{i + 1}</span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: avatarColor(t.name) }}
                    aria-hidden
                  >
                    {avatarInitial(t.name)}
                  </span>
                  <span className="truncate text-sm text-gray-700 transition-colors group-hover:text-indigo-600">
                    {t.name}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* 최신 댓글 */}
      <div className="h-full rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">최신 세이</h3>
          {totalComments > 0 && (
            <span className="text-xs text-gray-400">총 {totalComments.toLocaleString()}건</span>
          )}
        </div>
        {comments.length === 0 ? (
          <p className="py-5 text-center text-xs text-gray-400">아직 세이가 없어요</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => goCompany(c.companySlug, c.companyName)}
                  className="group flex w-full items-center gap-2 text-left"
                >
                  <span className="flex-1 truncate text-sm text-gray-700 transition-colors group-hover:text-indigo-600">
                    {c.content}
                  </span>
                  <span className="max-w-[34%] shrink-0 truncate text-xs font-medium text-indigo-500">
                    {c.companyName}
                  </span>
                </button>
              </li>
            ))}

            {/* 비로그인: 남은 댓글 수만큼(상한) 블러 행으로 영역 채움 + 로그인 게이트 */}
            {locked && hasMoreComments && (
              <>
                {BLUR_ROWS.slice(
                  0,
                  Math.min(BLUR_ROWS.length, totalComments - comments.length),
                ).map((r, i) => (
                  <li
                    key={`blur-${i}`}
                    aria-hidden
                    className="flex select-none items-center gap-2 blur-[3px]"
                  >
                    <span className="flex-1 truncate text-sm text-gray-700">{r.content}</span>
                    <span className="max-w-[34%] shrink-0 truncate text-xs font-medium text-indigo-500">
                      {r.company}
                    </span>
                  </li>
                ))}
                <li className="pt-1.5">
                  <Link
                    href="/login?callbackUrl=/"
                    onClick={() => trackEvent("sign_up_start", { from_path: "comment_login" })}
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Lock size={11} /> 로그인하고 더 보기
                  </Link>
                </li>
              </>
            )}

            {/* 로그인: 전체보기 */}
            {!locked && hasMoreComments && (
              <li className="pt-1">
                <Link
                  href="/comments"
                  className="flex items-center justify-center gap-0.5 text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  전체보기 <ChevronRight size={12} />
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
