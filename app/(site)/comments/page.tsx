import type { Metadata } from "next";
import { CommentsContainer } from "@/features/comments/CommentsContainer";

export const metadata: Metadata = {
  title: "코멘트 모아보기 | 세전세후",
  description: "기업별 솔직 코멘트를 한곳에서 모아보세요.",
};

export default function CommentsPage() {
  return <CommentsContainer />;
}
