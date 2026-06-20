"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageSquare, Send, ChevronRight, Clock, MoreHorizontal, Check, X, Lock } from "lucide-react";
import type { CompanyComment } from "../data";
import { trackEvent } from "@/lib/analytics";

type CompanySaySectionProps = {
  comments: CompanyComment[];
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment?: () => void;
  submitting?: boolean;
  submitError?: string | null;
  currentUserPublicId: string | null;
  onEditComment: (commentId: number, nextContent: string) => Promise<void> | void;
  onDeleteComment: (commentId: number) => Promise<void> | void;
};

export function CompanySaySection({
  comments,
  comment,
  onCommentChange,
  onSubmitComment,
  submitting = false,
  submitError = null,
  currentUserPublicId,
  onEditComment,
  onDeleteComment,
}: CompanySaySectionProps) {
  const isLoggedIn = currentUserPublicId !== null;
  // 최초 5개만 노출, "더보기"로 5개씩 추가 (단일행이라 5개 = 고정 높이)
  const [visibleCount, setVisibleCount] = useState(5);
  const canSubmit = isLoggedIn && comment.trim().length >= 2 && !submitting;
  const pathname = usePathname() || "/";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
      e.preventDefault();
      onSubmitComment?.();
    }
  };

  return (
    <div className="bg-card rounded-3xl p-5 border border-border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xs font-bold text-foreground tracking-tight">세전세후 세이(Say)</h2>
        </div>
        <Link
          href="/comments"
          className={`text-[10px] text-muted-foreground flex items-center hover:text-muted-foreground transition-colors ${
            isLoggedIn ? "" : "blur-[3px] select-none pointer-events-none"
          }`}
          aria-hidden={!isLoggedIn}
          tabIndex={isLoggedIn ? 0 : -1}
        >
          전체보기 <ChevronRight size={10} />
        </Link>
      </div>

      <div className="relative">
        <div
          className={
            isLoggedIn
              ? ""
              : "blur-[3px] select-none pointer-events-none min-h-[180px]"
          }
          aria-hidden={!isLoggedIn}
        >
          {comments.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              아직 세이가 없습니다. 첫 번째 의견을 남겨보세요!
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {comments.slice(0, visibleCount).map((c) => (
                  <CommentRow
                    key={c.id}
                    comment={c}
                    isOwner={isLoggedIn && c.userPublicId === currentUserPublicId}
                    onEdit={onEditComment}
                    onDelete={onDeleteComment}
                  />
                ))}
              </div>
              {visibleCount < comments.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + 5)}
                  className="w-full mb-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  더보기 {comments.length - visibleCount}개
                </button>
              )}
            </>
          )}

          {submitError && isLoggedIn && (
            <div className="text-xs text-red-500 mb-2 px-1">{submitError}</div>
          )}

          <div className="relative">
            <input
              type="text"
              className="w-full bg-muted border border-border rounded-full py-2.5 px-5 pr-12 text-xs focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-muted-foreground"
              placeholder="기업에 대한 의견을 남겨주세요. (2자 이상)"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isLoggedIn || submitting}
            />
            <button
              type="button"
              className={`absolute right-1.5 top-1.5 p-1 rounded-full transition-all ${
                canSubmit ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-muted-foreground"
              }`}
              disabled={!canSubmit}
              onClick={onSubmitComment}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5 bg-card/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-border">
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                <Lock size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                로그인 후 확인할 수 있어요
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                onClick={() =>
                  trackEvent("sign_up_start", { from_path: "comment_login" })
                }
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                로그인 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type CommentRowProps = {
  comment: CompanyComment;
  isOwner: boolean;
  onEdit: (commentId: number, nextContent: string) => Promise<void> | void;
  onDelete: (commentId: number) => Promise<void> | void;
};

function CommentRow({ comment, isOwner, onEdit, onDelete }: CommentRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const startEdit = () => {
    setDraft(comment.content);
    setEditing(true);
    setMenuOpen(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(comment.content);
  };

  const saveEdit = async () => {
    const trimmed = draft.trim();
    if (trimmed.length < 2 || trimmed === comment.content) {
      cancelEdit();
      return;
    }
    await onEdit(comment.id, trimmed);
    setEditing(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm("이 세이를 삭제하시겠습니까?")) return;
    await onDelete(comment.id);
  };

  if (editing) {
    return (
      <div className="bg-indigo-50/40 dark:bg-indigo-500/15 border border-indigo-100 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 whitespace-nowrap shrink-0">
            {comment.user}
          </span>
          <input
            type="text"
            className="flex-1 min-w-0 bg-card border border-indigo-200 rounded-md px-2 py-1 text-[11px] outline-none focus:ring-2 focus:ring-indigo-100"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveEdit();
              } else if (e.key === "Escape") {
                cancelEdit();
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={saveEdit}
            className="p-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
            aria-label="저장"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="p-1 rounded text-muted-foreground hover:bg-accent"
            aria-label="취소"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center justify-between gap-2 bg-muted hover:bg-indigo-50/30 px-4 py-2 rounded-xl border border-border transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 whitespace-nowrap shrink-0">
          {comment.user}
        </span>
        <p className="text-[11px] text-foreground truncate min-w-0 flex-1">
          {comment.content}
          {comment.edited && <span className="text-muted-foreground ml-1">(수정됨)</span>}
        </p>
      </div>
      <div className="flex items-center gap-1 text-[9px] text-muted-foreground whitespace-nowrap shrink-0">
        <Clock size={10} />
        {comment.time}
        {isOwner && (
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
              className="p-1 rounded hover:bg-gray-200/70 text-muted-foreground hover:text-foreground"
              aria-label="세이 메뉴"
            >
              <MoreHorizontal size={12} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-md text-[10px] py-1 min-w-[80px]">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={startEdit}
                  className="block w-full text-left px-3 py-1.5 hover:bg-accent text-foreground"
                >
                  수정
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleDelete}
                  className="block w-full text-left px-3 py-1.5 hover:bg-accent text-red-500"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
