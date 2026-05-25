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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
