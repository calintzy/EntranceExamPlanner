"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20" aria-label="로그인 안내">
      <div
        className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(26, 86, 219, 0.06), rgba(168, 85, 247, 0.06))",
          border: "1px solid rgba(26, 86, 219, 0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              로그인하면 모든 분석 기능을 무제한 이용할 수 있어요
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              카카오 · 구글 간편 로그인
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5 shrink-0"
          style={{ background: "var(--brand-blue)" }}
        >
          로그인
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
