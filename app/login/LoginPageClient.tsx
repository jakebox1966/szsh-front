"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { buildLoginUrl, useAuth } from "@/lib/auth";

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useAuth();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const go = (provider: "google" | "kakao") => {
    window.location.href = buildLoginUrl(provider, callbackUrl);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50/40 to-white px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group"
            aria-label="홈으로"
          >
            <span className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              szsh.kr
            </span>
          </Link>
          <h1 className="mt-6 text-xl sm:text-2xl font-semibold text-gray-900">
            로그인
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            소셜 계정으로 빠르게 시작하세요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => go("kakao")}
              className="w-full flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-[#FEE500] text-black text-sm sm:text-base font-medium hover:brightness-95 active:brightness-90 transition"
            >
              <KakaoIcon className="w-5 h-5" />
              <span>카카오로 시작하기</span>
            </button>

            <button
              type="button"
              onClick={() => go("google")}
              className="w-full flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm sm:text-base font-medium hover:bg-gray-50 active:bg-gray-100 transition"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Google로 시작하기</span>
            </button>
          </div>

          <p className="mt-6 text-xs text-center text-gray-400 leading-relaxed">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에<br className="sm:hidden" />
            {" "}동의하는 것으로 간주됩니다.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#000"
        d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.84 5.31 4.62 6.74-.2.74-.73 2.74-.83 3.17-.13.54.2.53.42.39.17-.11 2.7-1.83 3.79-2.57.66.1 1.34.15 2 .15 5.52 0 10-3.58 10-8s-4.48-7.88-10-7.88z"
      />
    </svg>
  );
}
