"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth, type AuthUser } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";

export function Header() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  // 홈 빼고는 헤더 검색창 항상 노출 (검색결과·상세·로그인 등 모든 곳에서 다시 검색 가능)
  const showSearch = pathname !== "/" && pathname !== null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    // 헤더 검색창은 home 외 모든 페이지에서 노출. 현재 경로에 따라 from_path 분기.
    const path: "company_detail" | "search_results" =
      pathname?.startsWith("/company/") ? "company_detail" : "search_results";
    trackEvent("search_enter", {
      from_path: path,
      keyword: trimmed,
      click_type: "search_result_page",
    });
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-white/70 supports-[backdrop-filter]:bg-white/55 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2 cursor-pointer group">
        <span className="relative inline-block text-xl font-bold tracking-tight">
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            aria-hidden
          >
            szsh.kr
          </span>
          <span
            className="absolute inset-0 bg-clip-text text-transparent bg-[length:200%_100%] bg-[linear-gradient(90deg,transparent_0%,transparent_35%,rgba(255,255,255,0.45)_50%,transparent_65%,transparent_100%)] animate-text-shine"
            aria-hidden
          >
            szsh.kr
          </span>
          <span className="sr-only">szsh.kr</span>
        </span>
      </Link>

      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-8 relative"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="다른 기업 검색..."
            className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
          />
        </form>
      )}

      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <span className="text-sm text-gray-400">…</span>
        ) : user ? (
          <UserMenu user={user} onLogout={logout} />
        ) : (
          <Link
            href="/login"
            onClick={() => trackEvent("sign_up_start", { from_path: "gnb_login" })}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}

function UserMenu({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const initial = user.nickname.trim().charAt(0) || "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <Avatar user={user} initial={initial} />
        <span className="text-sm font-medium text-gray-800 max-w-[100px] sm:max-w-[160px] truncate">
          {user.nickname}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden"
        >
          {/* 프로필 헤더 */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/40">
            <Avatar user={user} initial={initial} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user.nickname}
              </div>
              {user.email && (
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {user.email}
                </div>
              )}
            </div>
          </div>

          {/* 액션 — 추후 마이페이지/설정 추가 시 여기에 */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={15} className="text-gray-400" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({
  user,
  initial,
  size = "sm",
}: {
  user: AuthUser;
  initial: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? 40 : 28;
  if (user.profile_image) {
    return (
      <Image
        src={user.profile_image}
        alt={user.nickname}
        width={dim}
        height={dim}
        className={`rounded-full object-cover ${size === "lg" ? "w-10 h-10" : "w-7 h-7"}`}
        unoptimized
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold ${
        size === "lg" ? "w-10 h-10 text-base" : "w-7 h-7 text-xs"
      }`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
