"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";

const NOT_READY_MESSAGE = "아직 준비중입니다.";

export function CompanyDetailHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          szsh.ai
        </span>
      </Link>

      <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="다른 기업 검색..."
          className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        />
      </div>

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
