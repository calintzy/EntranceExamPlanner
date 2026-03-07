"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
              <svg width="22" height="22" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>입시연구소</span>
          </Link>
          <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
            로그인하고 맞춤 전략을 저장하세요
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="rounded-2xl p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          <div className="space-y-3">
            {/* 카카오 로그인 */}
            <button
              onClick={() => signIn("kakao", { callbackUrl: "/onboarding" })}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "#FEE500", color: "#191919" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.44 4.08 3.62 5.17-.16.57-.57 2.07-.66 2.39-.1.4.15.39.31.28.13-.08 2.04-1.38 2.87-1.94.61.09 1.23.13 1.86.13 4.42 0 8-2.79 8-6.24C17 3.79 13.42 1 9 1z" fill="#191919"/>
              </svg>
              카카오로 시작하기
            </button>

            {/* 구글 로그인 */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "white", color: "#333", border: "1px solid #ddd" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google로 시작하기
            </button>
          </div>

          {/* 혜택 안내 */}
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>로그인 혜택</p>
            <ul className="space-y-2">
              {[
                "맞춤 갭 분석 3개 대학 동시 비교",
                "분석 결과 저장 · 재방문 시 유지",
                "관심 대학 즐겨찾기",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 링크 */}
        <p className="text-center text-xs mt-4" style={{ color: "var(--text-tertiary)" }}>
          <Link href="/" className="hover:underline">홈으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
