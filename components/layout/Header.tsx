"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

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
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-white/90 backdrop-blur-sm border-b border-transparent">
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
          <>
            <span className="text-sm font-medium text-gray-700 max-w-[120px] sm:max-w-[200px] truncate">
              {user.nickname}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
