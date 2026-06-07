"use client";

import Link from "next/link";
import { MessageSquareQuote, Lock, ChevronRight } from "lucide-react";
import type { ApiCommentDigest } from "@/lib/api-types";
import { formatTimeAgo } from "@/lib/api-mappers";
import { useAuth } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";

type Props = { data: ApiCommentDigest | null };

// 비로그인 블러용 가짜 코멘트 (실제 행과 동일 마크업으로 렌더)
const BLUR_PLACEHOLDERS = [
  { company: "○○○○", nickname: "○○○○○", content: "성과급은 들쭉날쭉하지만 기본 복지는 탄탄한 편이라 만족하며 다녀요", time: "3시간 전" },
  { company: "○○○○", nickname: "○○○○○", content: "워라밸은 팀바이팀, 면접 분위기는 전반적으로 무난했습니다", time: "5시간 전" },
  { company: "○○○○", nickname: "○○○○○", content: "연봉 협상 여지는 있는 편이고 사이닝도 케이스에 따라 가능했어요", time: "1일 전" },
  { company: "○○○○", nickname: "○○○○○", content: "수평적이라곤 하지만 결국 팀장 성향 영향이 크다고 느꼈습니다", time: "2일 전" },
];

export function CommentDigestCard({ data }: Props) {
  const { status } = useAuth();
  const isAuthed = status === "authenticated";

  if (!data || data.items.length === 0) return null;

  const items = data.items; // 비로그인 1개 / 로그인 최대 5개
  const remaining = Math.max(0, data.totalCount - items.length);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
          <MessageSquareQuote size={12} /> 솔직 세이
        </span>
        {isAuthed ? (
          <Link
            href="/comments"
            className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-0.5"
          >
            전체보기 <ChevronRight size={14} />
          </Link>
        ) : (
          // 비로그인: 전체보기도 잠금 느낌으로 블러 (네비는 하단 CTA 로 유도)
          <span
            aria-hidden
            className="text-xs font-medium text-gray-400 flex items-center gap-0.5 blur-[2px] select-none"
          >
            전체보기 <ChevronRight size={14} />
          </span>
        )}
      </div>

      {/* 공개 코멘트 (비로그인 1 / 로그인 ≤5) + 비로그인은 블러 행으로 채움 */}
      <ul className="divide-y divide-gray-100">
        {items.map((c) => (
          <li key={c.id} className="py-2.5 first:pt-0">
            <Link href={`/company/${c.companySlug}`} className="block group">
              <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                &ldquo;{c.content}&rdquo;
              </p>
              <p className="mt-1 text-xs text-gray-400">
                <span className="font-semibold text-indigo-500 group-hover:text-indigo-600">
                  {c.companyName}
                </span>
                {" · "}
                {c.nickname}
                {" · "}
                {formatTimeAgo(c.createdAt)}
              </p>
            </Link>
          </li>
        ))}
        {/* 비로그인: 실제 행과 동일 마크업으로 블러 행을 채워 5행처럼 보이게 */}
        {!isAuthed &&
          BLUR_PLACEHOLDERS.slice(0, Math.min(BLUR_PLACEHOLDERS.length, remaining)).map(
            (f, i) => (
              <li key={`blur-${i}`} aria-hidden className="py-2.5 select-none blur-[5px]">
                <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                  &ldquo;{f.content}&rdquo;
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  <span className="font-medium text-gray-600">{f.company}</span>
                  {" · "}
                  {f.nickname}
                  {" · "}
                  {f.time}
                </p>
              </li>
            ),
          )}
      </ul>

      {/* CTA — 비로그인만. 로그인하면 헤더 '더보기'로 충분하므로 숨김 */}
      {!isAuthed && remaining > 0 && (
        <Link
          href="/login?callbackUrl=/"
          onClick={() => trackEvent("sign_up_start", { from_path: "comment_login" })}
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition active:scale-[0.99]"
        >
          <Lock size={13} /> 로그인하고 더보기
        </Link>
      )}
    </div>
  );
}
