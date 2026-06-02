import type { MetadataRoute } from "next";

const SITE_URL = "https://szsh.kr";

// 회사 상세 60k+ 까지 전부 sitemap 에 노출하려면 sitemap index 분할이 필요.
// 일단은 핵심 정적 페이지만 등록 — 검색엔진이 내부 링크 따라가며 자연 발견하도록.
// 트래픽 자리잡으면 /sitemap/companies/[page] 식으로 확장.

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
