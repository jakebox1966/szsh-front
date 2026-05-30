import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://szsh.kr";
const SITE_NAME = "szsh.kr";
const SITE_DESCRIPTION =
  "기업정보, 연봉, 실수령액, 전세·주담대·DSR 계산 등 세전세후 인사이트를 한곳에서.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "szsh.kr | 세전세후 AI-Powered Insights",
    template: "%s · szsh.kr",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "세전세후", "연봉 실수령액", "기업정보", "DART", "국민연금",
    "전세계산기", "주담대 계산기", "DSR 계산기", "평균연봉",
  ],
  authors: [{ name: "szsh.kr" }],
  creator: "szsh.kr",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "szsh.kr · 세전세후 AI-Powered Insights",
    description: SITE_DESCRIPTION,
    // 이미지는 app/opengraph-image.tsx 가 자동 주입.
  },
  twitter: {
    card: "summary_large_image",
    title: "szsh.kr · 세전세후 AI-Powered Insights",
    description: SITE_DESCRIPTION,
    // 이미지는 app/opengraph-image.tsx 가 트위터 카드에도 fallback 적용됨.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: SITE_URL,
  },
  // Search Console / 네이버 서치어드바이저에서 받은 코드 채우면 자동 메타 주입.
  // 환경변수로 빼서 .env 로 관리 — 키 노출돼도 사이트 소유 인증 외에는 의미 없음.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      "naver-site-verification":
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "",
    },
  },
};

// 구조화 데이터(JSON-LD) — 구글이 사이트 정보를 풍부하게 인식하도록.
// SoftwareApplication + WebSite 두 가지를 합쳐 sitelinks search box 후보로도 등록.
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_URL}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
