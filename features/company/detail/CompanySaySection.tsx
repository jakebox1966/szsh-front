"use client";

import { MessageSquare, Send, ChevronRight, Clock } from "lucide-react";
import type { CompanyComment } from "../data";

type CompanySaySectionProps = {
  comments: CompanyComment[];
  comment: string;
  onCommentChange: (value: string) => void;
};

export function CompanySaySection({
  comments,
  comment,
  onCommentChange,
}: CompanySaySectionProps) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-indigo-600" />
          <h2 className="text-xs font-bold text-gray-900 tracking-tight">세전세후 세이(Say)</h2>
        </div>
        <button
          type="button"
          className="text-[10px] text-gray-400 flex items-center hover:text-gray-600 transition-colors"
        >
          전체보기 <ChevronRight size={10} />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="group flex items-center justify-between bg-gray-50 hover:bg-indigo-50/30 px-4 py-2 rounded-xl border border-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-[10px] font-bold text-indigo-500 whitespace-nowrap min-w-[32px]">
                {c.user}
              </span>
              <p className="text-[11px] text-gray-700 truncate">{c.content}</p>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-400 whitespace-nowrap ml-4">
              <Clock size={10} />
              {c.time}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          className="w-full bg-gray-50 border border-gray-100 rounded-full py-2.5 px-5 pr-12 text-xs focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
          placeholder="기업에 대한 의견을 남겨주세요."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
        <button
          type="button"
          className={`absolute right-1.5 top-1.5 p-1 rounded-full transition-all ${
            comment.trim() ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-400"
          }`}
          disabled={!comment.trim()}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
