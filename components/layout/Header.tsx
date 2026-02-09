"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NOT_READY_MESSAGE = "아직 준비중입니다.";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-white/90 backdrop-blur-sm border-b border-transparent">
      <Link href="/" className="flex items-center gap-2 cursor-pointer group">
        <span className="relative inline-block text-xl font-bold tracking-tight">
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            aria-hidden
          >
            szsh.ai
          </span>
          <span
            className="absolute inset-0 bg-clip-text text-transparent bg-[length:200%_100%] bg-[linear-gradient(90deg,transparent_0%,transparent_35%,rgba(255,255,255,0.45)_50%,transparent_65%,transparent_100%)] animate-text-shine"
            aria-hidden
          >
            szsh.ai
          </span>
          <span className="sr-only">szsh.ai</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="hidden md:block text-sm font-medium text-gray-600 hover:text-black transition-colors"
          onClick={() => alert(NOT_READY_MESSAGE)}
        >
          Log in
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          onClick={() => alert(NOT_READY_MESSAGE)}
        >
          Sign up
        </button>
        <button
          type="button"
          className="md:hidden p-1 text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
