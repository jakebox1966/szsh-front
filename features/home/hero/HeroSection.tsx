"use client";

import { useState } from "react";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HomeTag } from "../data";

type HeroSectionProps = {
  tags: HomeTag[];
  activeTag: string;
  onTagChange: (label: string) => void;
};

export function HeroSection({
  tags,
  activeTag,
  onTagChange,
}: HeroSectionProps) {
  const [modalTag, setModalTag] = useState<HomeTag | null>(null);

  const openModal = (tag: HomeTag) => {
    setModalTag(tag);
    onTagChange(tag.label);
  };

  return (
    <div className="text-center mb-12 w-full animate-fade-in">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6">
        <Sparkles size={12} />
        <span>세전세후 AI-Powered Insights</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-medium mb-8 leading-tight text-[#1a1a1a] tracking-tight">
        무엇을 도와드릴까요?
      </h1>

      <div className="relative group w-full max-w-2xl mx-auto mb-8">
        <div className="relative bg-white rounded-[2rem] shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-gray-200 p-2 flex items-center transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-gray-300">
          <div className="pl-4 pr-3 text-gray-400">
            <Search size={22} strokeWidth={2} />
          </div>
          <input
            type="text"
            placeholder="기업정보, 연봉, 자산(부동산 매매, 전세) 등을 검색해보세요!"
            className="flex-1 bg-transparent border-none outline-none py-3 text-lg text-gray-800 placeholder-gray-400 font-medium"
          />
          <button
            type="button"
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors text-white shadow-md"
            onClick={() => alert("아직 준비중입니다.")}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div className="flex flex-nowrap justify-start md:justify-center gap-2 min-w-max px-2">
          {tags.map((tag) => {
            const Icon = tag.icon;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => openModal(tag)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap
                  ${
                    activeTag === tag.label
                      ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }
                `}
              >
                <Icon size={14} />
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Modal - shadcn Dialog */}
      <Dialog
        open={!!modalTag}
        onOpenChange={(open) => {
          if (!open) setModalTag(null);
        }}
      >
        <DialogContent>
          {modalTag && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = modalTag.icon;
                    return <Icon size={20} className="text-primary" />;
                  })()}
                  <DialogTitle>{modalTag.label}</DialogTitle>
                </div>
              </DialogHeader>
              <DialogDescription>
                여기에 {modalTag.label} 관련 내용을 넣을 수 있습니다.
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
