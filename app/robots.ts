import type { MetadataRoute } from "next";

const SITE_URL = "https://szsh.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // BFF 프록시 / 인증 콜백은 크롤링 의미 없음 — 색인 차단
        disallow: ["/api/", "/auth/", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
