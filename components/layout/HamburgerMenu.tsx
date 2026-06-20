"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Home, MessageCircle, Search, Sun, Moon, Monitor } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { peekAnonView } from "@/lib/viewQuota";
import { useTheme, type Theme } from "@/lib/theme";

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

  // 드로어 열리면 배경 스크롤 잠금. body 를 현재 스크롤 위치에 position:fixed 로 고정
  // → iOS Safari 포함 배경 스크롤 완전 차단. 닫으면 원복 + 스크롤 위치 복귀.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
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
        className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
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
              className={`fixed left-0 top-0 z-[60] flex h-dvh w-72 max-w-[85vw] flex-col bg-card shadow-xl transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* 상단: 세전세후 로고 + 닫기 */}
              <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
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
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 스크롤 영역 — 모바일에서 내용이 넘치면 여기서 스크롤 */}
              <div className="flex-1 min-h-0 overflow-y-auto">
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
                  label="최근 세이"
                  active={pathname === "/comments"}
                  onClick={() => setOpen(false)}
                />
              </nav>

              {/* 검색 횟수 사용량 카드 */}
              <div className="mt-1 border-t border-border px-5 py-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Search size={14} /> 일일 조회
                </div>
                <UsageRow loading={status === "loading"} quota={quota} />
                <p className="mt-2 px-1 text-[11px] text-muted-foreground">
                  매일 자정에 리셋됩니다
                </p>
              </div>
              </div>

              {/* 테마 선택 (라이트/다크/시스템) — 바닥 고정 */}
              <ThemeToggle />
            </aside>
          </>,
          document.body
        )}
    </>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const opts: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "라이트", icon: <Sun size={15} /> },
    { value: "dark", label: "다크", icon: <Moon size={15} /> },
    { value: "system", label: "시스템", icon: <Monitor size={15} /> },
  ];
  return (
    <div className="shrink-0 border-t border-border px-5 py-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        테마
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
        {opts.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={theme === o.value}
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              theme === o.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
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
          ? "bg-indigo-50 dark:bg-indigo-500/15 font-medium text-indigo-600 dark:text-indigo-400"
          : "text-foreground hover:bg-accent"
      }`}
    >
      <span
        className={
          active ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
        }
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

function UsageRow({ loading, quota }: { loading: boolean; quota: Quota | null }) {
  if (loading || quota === null) {
    return <div className="px-1 text-sm text-muted-foreground">…</div>;
  }
  if (quota.unlimited) {
    return (
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground">프리미엄</span>
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          무제한
        </span>
      </div>
    );
  }
  const used = quota.used ?? 0;
  const limit = quota.limit ?? 0;
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div className="px-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {quota.authenticated ? "무료 회원" : "비회원"}
        </span>
        <span className="text-sm font-semibold text-foreground">
          <span className="text-indigo-600 dark:text-indigo-400">{used}</span> /{" "}
          {limit}회
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
