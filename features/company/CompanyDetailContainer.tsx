"use client";

import { useState } from "react";
import { kakaoCompanyData } from "./data";
import type { CompanyData } from "./data";
import {
  CompanyDetailHeader,
  CompanyHeaderSection,
  CompanySaySection,
  SummaryCardsSection,
  SalaryDetailSection,
  HRAnalysisSection,
  FinanceSection,
  CompanyDetailFooter,
} from "./detail";

type CompanyDetailContainerProps = {
  slug: string;
  companyData?: CompanyData;
};

export function CompanyDetailContainer({
  slug,
  companyData = kakaoCompanyData,
}: CompanyDetailContainerProps) {
  const [comment, setComment] = useState("");
  const { info, summary, sampleComments, salary, hr, finance } = companyData;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1a1a1a] font-sans selection:bg-yellow-100 selection:text-yellow-900">
      <CompanyDetailHeader />

      <main className="pt-24 pb-20 px-4 md:px-6 max-w-3xl mx-auto">
        <CompanyHeaderSection info={info} />

        <CompanySaySection
          comments={sampleComments}
          comment={comment}
          onCommentChange={setComment}
        />

        <SummaryCardsSection summary={summary} />

        <div className="flex flex-col gap-6">
          <SalaryDetailSection salary={salary} />
          <HRAnalysisSection hr={hr} turnoverRate={summary.turnoverRate} />
          <FinanceSection finance={finance} />
        </div>
      </main>

      <CompanyDetailFooter />
    </div>
  );
}
