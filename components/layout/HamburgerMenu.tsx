"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Home, MessageCircle, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { peekAnonView } from "@/lib/viewQuota";

// 햄버거 버튼 하나 → 누르면 왼쪽에서 드로어가 슬라이드로 나온다.
// 오버레이·드로어는 document.body 로 포탈(헤더 backdrop-blur 의 containing block 밖으로).
const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

type Quota = {
  authenticated: boolean;
  unlimited: boolean;
  limit: number | null;
  used: number | null;
  remaining: number | null;
};

export function HamburgerMenu() {
  const { status } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [quota, setQuota] = useState<Quota | null>(null);
  const mounted = useMounted();

  // Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // 드로어 열릴 때 검색 사용량 갱신.
  //   비회원: localStorage 를 소비 없이 peek. 회원: 서버 /api/search/quota.
  //   두 카운터는 별개라 가입 시 차감 없이 0/20 시작.
  useEffect(() => {
    if (!open || status === "loading") return;
    let cancelled = false;
    (async () => {
      if (status === "unauthenticated") {
        const p = peekAnonView();
        if (!cancelled)
          setQuota({
            authenticated: false,
            unlimited: false,
            limit: p.limit,
            used: p.used,
            remaining: p.remaining,
          });
        return;
      }
      try {
        const d = await apiFetch<Quota>("/api/companies/view-quota");
        if (!cancelled) setQuota(d);
      } catch {
        if (!cancelled) setQuota(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, status]);

  return (
    <>
      {/* 햄버거 버튼 — 헤더 안에 위치 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
        className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <Menu size={22} />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* 오버레이 — 회색 + 블러. 클릭하면 닫힘 */}
            <div
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            {/* 드로어 — 왼쪽에서 슬라이드 */}
            <aside
              role="dialog"
              aria-modal="true"
              className={`fixed left-0 top-0 z-[60] flex h-screen w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* 상단: 세전세후 로고 + 닫기 */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="relative inline-block text-xl font-bold tracking-tight"
                >
                  <span
                    className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                    aria-hidden
                  >
                    세전세후
                  </span>
                  <span
                    className="absolute inset-0 bg-clip-text text-transparent bg-[length:200%_100%] bg-[linear-gradient(90deg,transparent_0%,transparent_35%,rgba(255,255,255,0.45)_50%,transparent_65%,transparent_100%)] animate-text-shine"
                    aria-hidden
                  >
                    세전세후
                  </span>
                  <span className="sr-only">세전세후</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="메뉴 닫기"
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 메뉴 (아이콘 포함) */}
              <nav className="space-y-1 p-3">
                <DrawerNavItem
                  href="/"
                  icon={<Home size={18} />}
                  label="홈"
                  active={pathname === "/"}
                  onClick={() => setOpen(false)}
                />
                <DrawerNavItem
                  href="/comments"
                  icon={<MessageCircle size={18} />}
                  label="인기댓글"
                  active={pathname === "/comments"}
                  onClick={() => setOpen(false)}
                />
              </nav>

              {/* 검색 횟수 사용량 카드 */}
              <div className="mt-1 border-t border-gray-100 px-5 py-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Search size={14} /> 일일 조회
                </div>
                <UsageRow loading={status === "loading"} quota={quota} />
                <p className="mt-2 px-1 text-[11px] text-gray-400">
                  매일 자정(KST)에 리셋됩니다
                </p>
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}

function DrawerNavItem({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-indigo-50 font-medium text-indigo-600"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className={active ? "text-indigo-600" : "text-gray-400"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function UsageRow({ loading, quota }: { loading: boolean; quota: Quota | null }) {
  if (loading || quota === null) {
    return <div className="px-1 text-sm text-gray-400">…</div>;
  }
  if (quota.unlimited) {
    return (
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-gray-600">프리미엄</span>
        <span className="text-sm font-semibold text-indigo-600">무제한</span>
      </div>
    );
  }
  const used = quota.used ?? 0;
  const limit = quota.limit ?? 0;
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div className="px-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {quota.authenticated ? "무료 회원" : "비회원"}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          <span className="text-indigo-600">{used}</span> / {limit}회
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
