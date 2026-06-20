import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// GA4 측정 ID. Vercel 환경변수에서 주입 — 비어있으면 GA 자체를 안 띄움.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://szsh.kr";
const SITE_NAME = "szsh";
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
    "세전세후",
    "연봉 실수령액",
    "기업정보",
    "DART",
    "국민연금",
    "전세계산기",
    "주담대 계산기",
    "DSR 계산기",
    "평균연봉",
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
      logo: `${SITE_URL}/icon`,
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 다크모드 FOUC 방지 — React 하이드레이션 전에 .dark 클래스 동기 세팅 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/*
          GA gtag.js — `<head>` 에 직접 삽입해서 React 하이드레이션 보다 먼저
          로드/실행되게 함. afterInteractive Script 컴포넌트를 쓰면 OAuth 콜백
          직후 발사되는 login/sign_up 이벤트가 gtag 준비 전에 호출돼 누락됨.
        */}
        {GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
