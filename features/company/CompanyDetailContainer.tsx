"use client";

import { useState, useEffect, useCallback } from "react";
import { kakaoCompanyData } from "./data";
import type { CompanyData, CompanyComment } from "./data";
import { RevealOnView } from "@/components/ui/RevealOnView";
import { apiFetch } from "@/lib/api";
import { mapCompanyDetail, mapCompanyComment } from "@/lib/api-mappers";
import type { ApiCompanyDetail, ApiCompanyComment } from "@/lib/api-types";
import { useAuth } from "@/lib/auth";
import {
  CompanyHeaderSection,
  CompanySaySection,
  SummaryCardsSection,
  SalaryDetailSection,
  HRAnalysisSection,
  FinanceSection,
  KeySignalsSection,
} from "./detail";

type CompanyDetailContainerProps = {
  slug: string;
};

export function CompanyDetailContainer({ slug }: CompanyDetailContainerProps) {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData>(kakaoCompanyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCompany() {
      try {
        const data = await apiFetch<ApiCompanyDetail>(`/api/companies/${slug}`);
        if (!cancelled) {
          setCompanyData(mapCompanyDetail(data));
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("기업 정보를 불러오지 못했습니다. 샘플 데이터를 표시합니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCompany();
    return () => { cancelled = true; };
  }, [slug]);

  const refreshComments = useCallback(async () => {
    try {
      const comments = await apiFetch<ApiCompanyComment[]>(
        `/api/companies/${slug}/comments`,
      );
      setCompanyData((prev) => ({
        ...prev,
        sampleComments: comments.map(mapCompanyComment),
      }));
    } catch {
      // silently fail
    }
  }, [slug]);

  const handleSubmitComment = useCallback(async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    if (trimmed.length < 2) {
      setSubmitError("2자 이상 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const tempComment: CompanyComment = {
      id: Date.now(),
      user: user?.nickname ?? "나",
      userId: user?.id ?? -1,
      content: trimmed,
      time: "방금 전",
      edited: false,
    };
    setCompanyData((prev) => ({
      ...prev,
      sampleComments: [tempComment, ...prev.sampleComments],
    }));
    setComment("");

    try {
      await apiFetch(`/api/companies/${slug}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: trimmed }),
      });
      await refreshComments();
    } catch {
      setCompanyData((prev) => ({
        ...prev,
        sampleComments: prev.sampleComments.filter((c) => c.id !== tempComment.id),
      }));
      setComment(trimmed);
      setSubmitError("댓글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }, [comment, slug, refreshComments, user]);

  const handleEditComment = useCallback(
    async (commentId: number, nextContent: string) => {
      const trimmed = nextContent.trim();
      if (trimmed.length < 2) return;

      const prevSnapshot = companyData.sampleComments;
      setCompanyData((prev) => ({
        ...prev,
        sampleComments: prev.sampleComments.map((c) =>
          c.id === commentId
            ? { ...c, content: trimmed, edited: true, time: "방금 전" }
            : c,
        ),
      }));

      try {
        await apiFetch(`/api/companies/${slug}/comments/${commentId}`, {
          method: "PUT",
          body: JSON.stringify({ content: trimmed }),
        });
        await refreshComments();
      } catch {
        setCompanyData((prev) => ({ ...prev, sampleComments: prevSnapshot }));
      }
    },
    [companyData.sampleComments, slug, refreshComments],
  );

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      const prevSnapshot = companyData.sampleComments;
      setCompanyData((prev) => ({
        ...prev,
        sampleComments: prev.sampleComments.filter((c) => c.id !== commentId),
      }));
      try {
        await apiFetch(`/api/companies/${slug}/comments/${commentId}`, {
          method: "DELETE",
        });
      } catch {
        setCompanyData((prev) => ({ ...prev, sampleComments: prevSnapshot }));
      }
    },
    [companyData.sampleComments, slug],
  );

  const { info, summary, sampleComments, salary, hr, finance } = companyData;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#1a1a1a] font-sans">
        <main className="pt-24 pb-20 px-4 md:px-6 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-7 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-100 rounded w-64" />
                </div>
              </div>
              <div className="h-20 bg-gray-50 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="h-4 bg-gray-100 rounded w-20 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1a1a1a] font-sans selection:bg-yellow-100 selection:text-yellow-900">
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-3xl mx-auto">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 mb-4">
            {error}
          </div>
        )}

        <RevealOnView>
          <CompanyHeaderSection info={info}>
            <KeySignalsSection companyData={companyData} />
          </CompanyHeaderSection>
        </RevealOnView>

        <RevealOnView delay={80}>
          <CompanySaySection
            comments={sampleComments}
            comment={comment}
            onCommentChange={setComment}
            onSubmitComment={handleSubmitComment}
            submitting={submitting}
            submitError={submitError}
            currentUserId={user?.id ?? null}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        </RevealOnView>

        <RevealOnView>
          <SummaryCardsSection summary={summary} />
        </RevealOnView>

        <div className="flex flex-col gap-6">
          <RevealOnView>
            <SalaryDetailSection salary={salary} />
          </RevealOnView>
          <RevealOnView>
            <HRAnalysisSection hr={hr} turnoverRate={summary.turnoverRate} />
          </RevealOnView>
          <RevealOnView>
            <FinanceSection finance={finance} />
          </RevealOnView>
        </div>
      </main>
    </div>
  );
}
