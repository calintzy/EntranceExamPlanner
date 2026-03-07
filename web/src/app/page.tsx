import Link from "next/link";
import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getUniversityList } from "@/lib/course-utils";
import MobileNav from "@/components/mobile-nav";
import AuthButton from "@/components/auth-button";
import DesktopNav from "@/components/desktop-nav";
import LoginBanner from "@/components/login-banner";
import ScrollReveal from "@/components/scroll-reveal";
import { BASE_URL, BRAND_NAME, UNIVERSITY_COUNT } from "@/lib/site-config";

/* ── 메타데이터 ── */
export const metadata: Metadata = {
  title: `${BRAND_NAME} — 2028 대학별 권장과목 비교 · 역방향 검색`,
  description:
    `전국 ${UNIVERSITY_COUNT}개 대학의 전공연계 핵심권장과목을 한눈에 비교하고, 내가 선택한 과목으로 유리한 대학을 찾아보세요. adiga.kr 공식 데이터 기반 무료 서비스.`,
  openGraph: {
    title: `${BRAND_NAME} — 2028 대학별 권장과목 비교 · 역방향 검색`,
    description:
      `전국 ${UNIVERSITY_COUNT}개 대학의 전공연계 핵심권장과목을 한눈에 비교하세요.`,
  },
};

/* ── 빌드 타임 데이터 ── */
const universities = getUniversityList(courseData);
const totalDepts = Object.values(courseData).reduce(
  (sum, depts) => sum + Object.keys(depts).length,
  0
);

/* ── JSON-LD ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND_NAME,
  url: BASE_URL,
  description: `${universities.length}개 대학의 전공연계 핵심권장과목과 권장과목을 한눈에 비교하세요.`,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/search`,
    "query-input": "required name=search_term_string",
  },
};

/* ── FAQ 데이터 ── */
const faqItems = [
  {
    q: "입시연구소는 어떤 서비스인가요?",
    a: "입시연구소는 전국 대학의 전공연계 권장과목을 한눈에 비교하고, 내가 선택한 과목으로 어떤 대학에 유리한지 역방향 검색할 수 있는 무료 서비스입니다. 2028 고교학점제 전면 시행에 대비한 교과 선택 전략 수립에 활용하세요.",
  },
  {
    q: "데이터는 어디서 가져오나요?",
    a: "대입정보포털 adiga.kr(한국대학교육협의회 운영)의 공식 발표 자료와 각 대학 입학처 모집요강을 기반으로 합니다. 다만 참고용 정보이므로, 최종 확인은 반드시 각 대학 입학처를 통해 하시길 권장합니다.",
  },
  {
    q: "무료인가요? 로그인하면 뭐가 달라지나요?",
    a: "모든 기본 기능(교과 가이드, 역방향 검색)은 비로그인으로도 이용 가능합니다. 로그인하면 맞춤 전략 분석, 전략 포트폴리오, 시너지 맵 등 심화 분석 기능을 무제한으로 사용할 수 있습니다.",
  },
  {
    q: "2028 대입에서 과목 선택이 왜 중요한가요?",
    a: "2028학년도부터 고교학점제가 전면 시행되며, 대학들이 전공별로 핵심권장과목과 권장과목을 공식 지정합니다. 핵심권장과목을 이수하지 않으면 입시에서 불이익을 받을 수 있어, 미리 확인하고 준비하는 것이 중요합니다.",
  },
  {
    q: "수록 대학은 몇 개인가요?",
    a: `서울대, 연세대, 고려대 등 주요 대학부터 지방거점 국립대까지 전국 ${universities.length}개 대학의 정보를 수록하고 있으며, 지속적으로 확대하고 있습니다.`,
  },
];

/* ── JSON-LD FAQ ── */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/* ============================
   페이지 컴포넌트
   ============================ */
export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ═══════════════════════════════════════
          1. 헤더
         ═══════════════════════════════════════ */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                <svg width="18" height="18" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                  <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                  <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                  <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                입시연구소
              </span>
            </div>

            <DesktopNav />

            <div className="flex items-center gap-2">
              <AuthButton />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ═══════════════════════════════════════
            2. 히어로
           ═══════════════════════════════════════ */}
        <section className="hero-grid-bg relative overflow-hidden snap-section snap-panel-full" aria-labelledby="hero-heading">
          <div className="hero-blob-1" aria-hidden="true" />
          <div className="hero-blob-2" aria-hidden="true" />
          <div className="hero-blob-3" aria-hidden="true" />

          <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center" style={{ zIndex: 1 }}>
            <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8">
              <span
                className="badge-live inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full"
                style={{ background: "rgba(26, 86, 219, 0.08)", color: "var(--brand-blue)", border: "1px solid rgba(26, 86, 219, 0.16)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                adiga.kr 공식 데이터 기반 · 무료 서비스
              </span>
            </div>

            <h1
              id="hero-heading"
              className="animate-fade-in-up-delay-1 font-bold tracking-tight leading-[1.15] mb-8"
              style={{ color: "var(--text-primary)", fontSize: "clamp(2.25rem, 5vw + 0.5rem, 4.5rem)" }}
            >
              2028 대입,
              <br />
              <span className="text-gradient">무엇부터 준비</span>해야 할지
              <br />
              막막하신가요?
            </h1>

            <p
              className="animate-fade-in-up-delay-2 max-w-2xl mx-auto mb-12 leading-relaxed"
              style={{ color: "var(--text-secondary)", fontSize: "clamp(0.95rem, 1.2vw + 0.3rem, 1.2rem)" }}
            >
              전국 {universities.length}개 대학의 전공연계 핵심권장과목을 한눈에 비교하고,
              <br className="hidden md:block" />
              내가 선택한 과목으로 어떤 대학에 유리한지 바로 확인하세요.
            </p>

            <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/guide"
                className="btn-glow inline-flex items-center justify-center gap-2.5 px-9 py-4.5 text-base font-semibold text-white rounded-2xl"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #4338ca 100%)" }}
              >
                교과 선택 가이드
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2.5 px-9 py-4.5 text-base font-semibold rounded-2xl transition-all hover:-translate-y-0.5"
                style={{
                  color: "var(--text-primary)",
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid var(--border-medium)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                내 과목으로 대학 찾기
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            2-1. 감성 공감 — 3-beat: 불안 → 이해 → 동행
           ═══════════════════════════════════════ */}
        <section className="empathy-section snap-section snap-panel py-20 md:py-28" aria-labelledby="empathy-heading">
          <div className="max-w-5xl mx-auto px-6">
            <ScrollReveal className="text-center mb-14">
              <h2
                id="empathy-heading"
                className="font-bold leading-snug mb-4"
                style={{ color: "var(--text-primary)", fontSize: "clamp(1.35rem, 2.5vw + 0.3rem, 2rem)" }}
              >
                정보는 많아도,<br />
                우리 아이에게 맞는 선택은 더 어렵습니다
              </h2>
              <p className="text-sm md:text-base" style={{ color: "var(--text-tertiary)" }}>
                모든 부모님이 겪는 고민, 입시연구소가 함께합니다
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-5 md:gap-6">
              {/* Beat 1: 불안 */}
              <ScrollReveal delay={1}>
                <div className="empathy-card">
                  <div className="empathy-icon" style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.06))" }}>
                    <svg className="w-6 h-6" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    막막한 시작
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    고교학점제, 핵심권장, 권장과목… 낯선 용어들 사이에서 아이의 미래를 위한 선택이 어렵습니다
                  </p>
                </div>
              </ScrollReveal>

              {/* Beat 2: 이해 */}
              <ScrollReveal delay={2}>
                <div className="empathy-card">
                  <div className="empathy-icon" style={{ background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(96, 165, 250, 0.06))" }}>
                    <svg className="w-6 h-6" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    충분히 이해합니다
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    정답 찾기가 아닙니다. 아이에게 맞는 경로를 데이터를 통해 좁혀가는 과정이에요
                  </p>
                </div>
              </ScrollReveal>

              {/* Beat 3: 동행 */}
              <ScrollReveal delay={3}>
                <div className="empathy-card">
                  <div className="empathy-icon" style={{ background: "linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(16, 185, 129, 0.06))" }}>
                    <svg className="w-6 h-6" style={{ color: "#059669" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    든든한 나침반
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {universities.length}개 대학 공식 데이터를 기반으로 입시연구소가 함께 준비합니다
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            3. 신뢰 스트립
           ═══════════════════════════════════════ */}
        <section className="trust-strip" aria-label="서비스 신뢰도">
          <div className="max-w-6xl mx-auto px-6 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{universities.length}개</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>대학</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{totalDepts.toLocaleString()}+</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>학과</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>adiga.kr</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>공식 데이터</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>2028</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>학년도 기준</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            4. 30초 사용법
           ═══════════════════════════════════════ */}
        <section className="snap-section snap-panel max-w-6xl mx-auto px-6 py-20 md:py-24" aria-labelledby="howto-heading">
          <ScrollReveal className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
              How it works
            </p>
            <h2 id="howto-heading" className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              30초면 충분합니다
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            <div className="step-connector text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, rgba(26, 86, 219, 0.12), rgba(67, 56, 202, 0.12))" }}
              >
                <span className="text-xl font-bold" style={{ color: "var(--brand-blue)" }}>1</span>
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                목표 대학 · 학과 선택
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                교과 가이드에서 관심 대학과
                <br />
                희망 학과를 선택하세요
              </p>
            </div>

            <div className="step-connector text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(16, 185, 129, 0.1))" }}
              >
                <span className="text-xl font-bold" style={{ color: "#059669" }}>2</span>
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                권장과목 확인 · 비교
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                핵심권장과목과 권장과목을
                <br />
                대학별로 비교합니다
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(251, 191, 36, 0.1))" }}
              >
                <span className="text-xl font-bold" style={{ color: "#d97706" }}>3</span>
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                내 과목으로 역검색
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                선택한 과목으로 유리한
                <br />
                대학 · 학과를 찾아보세요
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            5. 핵심 기능 — 2개 대형 카드
           ═══════════════════════════════════════ */}
        <section className="snap-section snap-panel max-w-6xl mx-auto px-6 pb-16" aria-labelledby="core-features-heading">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
              Core Features
            </p>
            <h2 id="core-features-heading" className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              핵심 기능
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 교과 선택 가이드 */}
            <Link href="/guide" className="feature-card rounded-2xl p-8 md:p-10 block group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, rgba(26, 86, 219, 0.12), rgba(67, 56, 202, 0.12))" }}
              >
                <svg className="w-7 h-7" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                교과 선택 가이드
              </h3>
              <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                {universities.length}개 대학의 전공연계 핵심권장과목을 한눈에 비교하세요.
                <br />
                같은 학과라도 대학마다 요구하는 과목이 다릅니다.
              </p>
              <span className="inline-flex items-center gap-2 text-base font-semibold" style={{ color: "var(--brand-blue)" }}>
                가이드 시작하기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 역방향 검색 */}
            <Link href="/search" className="feature-card rounded-2xl p-8 md:p-10 block group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(251, 191, 36, 0.1))" }}
              >
                <svg className="w-7 h-7" style={{ color: "#d97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                역방향 검색
              </h3>
              <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                내가 선택한 과목을 입력하면, 해당 과목을 핵심권장하는
                <br />
                대학과 학과를 자동으로 찾아줍니다.
              </p>
              <span className="inline-flex items-center gap-2 text-base font-semibold" style={{ color: "#d97706" }}>
                검색 시작하기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            6. 분석 도구 — 6개 소형 카드
           ═══════════════════════════════════════ */}
        <section className="snap-section snap-panel max-w-6xl mx-auto px-6 pb-24" aria-labelledby="tools-heading">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
              Analysis Tools
            </p>
            <h2 id="tools-heading" className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              더 깊은 분석이 필요하다면
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* 맞춤 전략 */}
            <Link href="/my-strategy" className="feature-card rounded-xl p-5 block group">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(139, 92, 246, 0.1))" }}
                >
                  <svg className="w-5 h-5" style={{ color: "#7c3aed" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>맞춤 전략</h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-tertiary)" }}>
                목표 대학과 현재 수강 과목으로 적합도 점수를 분석합니다
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#7c3aed" }}>
                시작하기
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 전략 포트폴리오 */}
            <Link href="/portfolio" className="feature-card rounded-xl p-5 block group">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(219, 39, 119, 0.1))" }}
                >
                  <svg className="w-5 h-5" style={{ color: "#db2777" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>전략 포트폴리오</h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-tertiary)" }}>
                목표 대학 여러 개를 동시 분석하여 최적 과목 조합을 추천합니다
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#db2777" }}>
                시작하기
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 시너지 맵 */}
            <Link href="/synergy" className="feature-card rounded-xl p-5 block group">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.1))" }}
                >
                  <svg className="w-5 h-5" style={{ color: "#7c3aed" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>시너지 맵</h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-tertiary)" }}>
                어떤 과목이 함께 추천되는지 시너지 관계를 분석합니다
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#7c3aed" }}>
                시작하기
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 이수 타임라인 */}
            <Link href="/timeline" className="feature-card rounded-xl p-5 block group">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.1))" }}
                >
                  <svg className="w-5 h-5" style={{ color: "#059669" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>이수 타임라인</h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-tertiary)" }}>
                고1→고2→고3 학년별 최적 과목 배치를 제안합니다
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#059669" }}>
                시작하기
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 친구와 비교 */}
            <Link href="/compare" className="feature-card rounded-xl p-5 block group">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(234, 88, 12, 0.1))" }}
                >
                  <svg className="w-5 h-5" style={{ color: "#ea580c" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>친구와 비교</h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-tertiary)" }}>
                URL 공유로 두 과목 리스트를 비교하여 각자 유리한 대학을 찾습니다
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#ea580c" }}>
                시작하기
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 과목 교체 시뮬레이션 */}
            <Link href="/swap" className="feature-card rounded-xl p-5 block group">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(2, 132, 199, 0.1))" }}
                >
                  <svg className="w-5 h-5" style={{ color: "#0284c7" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>교체 시뮬레이션</h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-tertiary)" }}>
                과목을 바꾸면 적합도가 어떻게 변하는지 시뮬레이션합니다
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#0284c7" }}>
                시작하기
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            7. 로그인 배너 (비로그인 시만 표시)
           ═══════════════════════════════════════ */}
        <LoginBanner />

        {/* ═══════════════════════════════════════
            8. FAQ
           ═══════════════════════════════════════ */}
        <section className="snap-section max-w-3xl mx-auto px-6 pb-24" aria-labelledby="faq-heading">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
              FAQ
            </p>
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              자주 묻는 질문
            </h2>
          </ScrollReveal>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <details key={idx} className="faq-item">
                <summary>{item.q}</summary>
                <div className="faq-answer">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            9. 최종 CTA
           ═══════════════════════════════════════ */}
        <section className="final-cta-section snap-section snap-panel-short py-20 md:py-24" aria-labelledby="final-cta-heading">
          <div className="final-cta-glow" aria-hidden="true" />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <h2 id="final-cta-heading" className="text-2xl md:text-3xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-base text-blue-200 mb-8 leading-relaxed">
              우리 아이에게 맞는 교과 선택,
              <br className="md:hidden" />
              입시연구소와 함께 준비하세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/guide"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5"
                style={{ background: "var(--brand-blue)", boxShadow: "0 8px 30px rgba(37, 99, 235, 0.4)" }}
              >
                교과 선택 가이드 시작하기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl transition-all hover:-translate-y-0.5"
                style={{ color: "white", background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", backdropFilter: "blur(16px)" }}
              >
                내 과목으로 대학 찾기
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════
          10. 푸터
         ═══════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                  <svg width="15" height="15" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                    <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                    <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                    <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>입시연구소</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                고교학점제 시대를 위한 전략적 교과 선택 가이드
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="푸터 네비게이션">
              <Link href="/guide" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>교과 가이드</Link>
              <Link href="/search" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>과목 검색</Link>
              <Link href="/my-strategy" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>맞춤 전략</Link>
              <Link href="/portfolio" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>포트폴리오</Link>
              <Link href="/universities" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>수록 대학</Link>
              <Link href="/policy" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>2028 정책</Link>
              <Link href="/contract" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>계약학과</Link>
            </nav>
          </div>

          <div className="divider-gradient mb-8" />

          <div className="space-y-2">
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              데이터 출처: 대입정보포털 adiga.kr (대교협 공식) 및 각 대학 입학처 모집요강 (2026·2028학년도 기준)
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)", opacity: 0.75 }}>
              본 서비스는 참고용 정보를 제공하며, 대학 입학 전형의 공식 기준이 아닙니다.
              정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처 공식 자료를 통해 확인하시기 바랍니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
