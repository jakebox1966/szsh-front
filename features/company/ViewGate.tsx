"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

/** 상세 조회 한도 초과 게이트. anon=비회원(로그인 유도), free=무료회원(내일 다시). */
export function ViewGate({ reason, slug }: { reason: "anon" | "free"; slug: string }) {
  const isAnon = reason === "anon";
  return (
    <div className="mx-auto max-w-xl bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-4">
        <Lock size={20} />
      </div>
      {isAnon ? (
        <>
          <p className="text-gray-800 font-semibold mb-1">
            오늘 비회원 조회 횟수를 다 썼어요
          </p>
          <p className="text-gray-500 text-sm mb-5">
            로그인하면 하루 20개 기업까지 볼 수 있어요.
          </p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/company/${slug}`)}`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            로그인하고 계속 보기
          </Link>
        </>
      ) : (
        <>
          <p className="text-gray-800 font-semibold mb-1">
            오늘 조회 한도를 다 썼어요
          </p>
          <p className="text-gray-500 text-sm">내일 다시 이용해주세요.</p>
        </>
      )}
    </div>
  );
}
