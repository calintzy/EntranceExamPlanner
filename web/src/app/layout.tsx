import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BASE_URL, BRAND_NAME, UNIVERSITY_COUNT } from "@/lib/site-config";
import AuthProvider from "@/components/auth-provider";
import SmoothScroll from "@/components/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} - 대학별 권장과목 비교 & 역방향 검색`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    `전국 ${UNIVERSITY_COUNT}개 대학의 전공연계 핵심권장과목과 권장과목을 한눈에 비교하세요. 내가 선택한 과목으로 유리한 대학을 역방향 검색할 수 있습니다.`,
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} - ${UNIVERSITY_COUNT}개 대학 권장과목 비교 & 역방향 검색`,
    description:
      `전국 ${UNIVERSITY_COUNT}개 대학의 전공연계 핵심권장과목을 비교하고, 내 과목으로 유리한 대학을 찾아보세요.`,
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} - 대학별 권장과목 비교`,
    description:
      `전국 ${UNIVERSITY_COUNT}개 대학 전공연계 권장과목 비교 및 역방향 검색 서비스`,
  },
  keywords: [
    "입시연구소",
    "권장과목",
    "핵심권장과목",
    "전공연계교과",
    "고교학점제",
    "대학별 권장과목",
    "교과 선택",
    "서울대 권장과목",
    "연세대 권장과목",
    "고려대 권장과목",
    "2026학년도 입시",
    "2028학년도 입시",
    "역방향 검색",
  ],
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // Google Search Console과 네이버 웹마스터 인증 후 값 입력
    // google: "구글_인증코드",
    // other: { "naver-site-verification": "네이버_인증코드" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ colorScheme: "light" }} data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SmoothScroll />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
