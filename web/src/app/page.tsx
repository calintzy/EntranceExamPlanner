import Link from "next/link";
import { courseData } from "@/lib/course-data";
import { getUniversityList } from "@/lib/course-utils";
import universityMeta from "@/lib/university_meta.json";

const universities = getUniversityList(courseData);
const totalDepts = Object.values(courseData).reduce(
  (sum, depts) => sum + Object.keys(depts).length,
  0
);

// 권역별 대학 그룹
type MetaEntry = { year: number; region?: string; location?: string; source: string };
const meta = universityMeta as Record<string, MetaEntry>;
const regionGroups: Record<string, string[]> = {};
for (const name of universities) {
  const m = meta[name];
  const region = m?.region ?? "주요 대학";
  if (!regionGroups[region]) regionGroups[region] = [];
  regionGroups[region].push(name);
}
const regionOrder = ["주요 대학", "수도권", "중부권", "영남권", "호남권"];

// 권역별 색상 매핑
const regionColorMap: Record<string, string> = {
  "주요 대학": "text-blue-500",
  "수도권": "text-indigo-500",
  "중부권": "text-emerald-500",
  "영남권": "text-amber-500",
  "호남권": "text-violet-500",
};

const regionChipColorMap: Record<string, string> = {
  "주요 대학": "hover:bg-blue-600 hover:text-white hover:border-blue-600",
  "수도권": "hover:bg-indigo-600 hover:text-white hover:border-indigo-600",
  "중부권": "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
  "영남권": "hover:bg-amber-600 hover:text-white hover:border-amber-600",
  "호남권": "hover:bg-violet-600 hover:text-white hover:border-violet-600",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "입시플래너",
  url: "https://web-kappa-sable-82.vercel.app",
  description: `${universities.length}개 대학의 전공연계 핵심권장과목과 권장과목을 한눈에 비교하세요.`,
  potentialAction: {
    "@type": "SearchAction",
    target: "https://web-kappa-sable-82.vercel.app/search",
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 헤더 ── */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              {/* 로고 아이콘 — 순수 SVG */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 14L3 7M7 14V4M11 14V9M15 14V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                입시플래너
              </span>
            </div>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center gap-1" aria-label="메인 네비게이션">
              <Link
                href="/guide"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link"
                style={{ color: "var(--text-secondary)" }}
              >
                교과 가이드
              </Link>
              <Link
                href="/search"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link"
                style={{ color: "var(--text-secondary)" }}
              >
                과목 검색
              </Link>
              <Link
                href="/policy"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link"
                style={{ color: "var(--text-secondary)" }}
              >
                2028 정책
              </Link>
              <span
                className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-full badge-live"
                style={{
                  background: "rgba(26, 86, 219, 0.1)",
                  color: "var(--brand-blue-light)",
                  border: "1px solid rgba(26, 86, 219, 0.2)",
                }}
              >
                2026 · 2028
              </span>
            </nav>

            {/* 모바일 CTA */}
            <Link
              href="/guide"
              className="md:hidden px-4 py-2 text-sm font-semibold text-white rounded-lg btn-glow"
              style={{ background: "var(--brand-blue)" }}
            >
              가이드 보기
            </Link>
          </div>
        </div>
      </header>

      {/* ── 히어로 섹션 ── */}
      <main>
        <section
          className="hero-grid-bg relative overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* 플로팅 블롭 장식 */}
          <div className="hero-blob-1" aria-hidden="true" />
          <div className="hero-blob-2" aria-hidden="true" />

          <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">

            {/* 상단 배지 */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
                style={{
                  background: "rgba(26, 86, 219, 0.08)",
                  color: "var(--brand-blue)",
                  border: "1px solid rgba(26, 86, 219, 0.16)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
                {universities.length}개 대학 &middot; {totalDepts.toLocaleString()}개 학과 · 무료 서비스
              </span>
            </div>

            {/* 메인 헤딩 */}
            <h1
              id="hero-heading"
              className="animate-fade-in-up-delay-1 text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              목표 대학에 맞는
              <br />
              <span className="text-gradient">교과 선택</span>
              <br />
              <span className="text-5xl md:text-6xl font-bold" style={{ color: "var(--text-primary)" }}>
                을 안내합니다
              </span>
            </h1>

            {/* 서브 헤딩 */}
            <p
              className="animate-fade-in-up-delay-2 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              전국 {universities.length}개 대학의 전공연계 핵심권장과목을 한눈에 비교하세요.
              <br className="hidden md:block" />
              고1부터 시작하는 전략적 교과 선택이 합격의 첫걸음입니다.
            </p>

            {/* CTA 버튼 그룹 */}
            <div className="animate-fade-in-up-delay-3 flex flex-wrap justify-center gap-4">
              <Link
                href="/guide"
                className="btn-glow inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl"
                style={{ background: "var(--brand-blue)" }}
              >
                교과 선택 가이드
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl transition-all hover:-translate-y-0.5"
                style={{
                  color: "var(--text-primary)",
                  background: "var(--surface-glass)",
                  border: "1px solid var(--border-medium)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                내 과목으로 대학 찾기
              </Link>
            </div>

            {/* 히어로 하단 — 스크롤 힌트 */}
            <div className="mt-20 flex flex-col items-center gap-2" aria-hidden="true">
              <div
                className="w-px h-12 opacity-20"
                style={{ background: "linear-gradient(to bottom, transparent, var(--text-secondary))" }}
              />
            </div>
          </div>
        </section>

        {/* ── 피처 카드 섹션 ── */}
        <section
          className="max-w-6xl mx-auto px-6 py-24"
          aria-labelledby="features-heading"
        >
          <h2
            id="features-heading"
            className="sr-only"
          >
            주요 기능
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 카드 1 — 핵심권장과목 확인 */}
            <Link href="/guide" className="feature-card rounded-2xl p-7 block group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, rgba(26, 86, 219, 0.12), rgba(67, 56, 202, 0.12))" }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--brand-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--brand-blue)" }}
              >
                핵심 기능 01
              </div>
              <h3
                className="text-lg font-bold mb-2.5"
                style={{ color: "var(--text-primary)" }}
              >
                핵심권장과목 확인
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--text-secondary)" }}
              >
                대학이 공식 지정한 전공 연계 핵심권장과목을 학과별로 확인할 수 있습니다.
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-gap group-hover:gap-2.5"
                style={{ color: "var(--brand-blue)" }}
              >
                가이드 보기
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 카드 2 — 대학간 비교 */}
            <Link href="/guide" className="feature-card rounded-2xl p-7 block group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(16, 185, 129, 0.1))" }}
              >
                <svg className="w-6 h-6" style={{ color: "#059669" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#059669" }}
              >
                핵심 기능 02
              </div>
              <h3
                className="text-lg font-bold mb-2.5"
                style={{ color: "var(--text-primary)" }}
              >
                대학간 비교
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--text-secondary)" }}
              >
                같은 학과라도 대학마다 다른 권장과목. {universities.length}개 대학을 나란히 놓고 비교합니다.
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-gap group-hover:gap-2.5"
                style={{ color: "#059669" }}
              >
                비교하기
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* 카드 3 — 역방향 검색 */}
            <Link href="/search" className="feature-card rounded-2xl p-7 block group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(251, 191, 36, 0.1))" }}
              >
                <svg className="w-6 h-6" style={{ color: "#d97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#d97706" }}
              >
                핵심 기능 03
              </div>
              <h3
                className="text-lg font-bold mb-2.5"
                style={{ color: "var(--text-primary)" }}
              >
                역방향 검색
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--text-secondary)" }}
              >
                내가 선택한 과목으로 어떤 대학·학과에 유리한지 역방향으로 검색할 수 있습니다.
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-gap group-hover:gap-2.5"
                style={{ color: "#d97706" }}
              >
                과목으로 찾기
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </section>

        {/* ── 신뢰 섹션 (Trust Section) ── */}
        <section className="trust-section py-20" aria-labelledby="trust-heading">
          <div className="trust-section-glow" aria-hidden="true" />
          <div className="relative max-w-6xl mx-auto px-6">

            {/* 섹션 레이블 */}
            <div className="text-center mb-14">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--brand-blue)" }}
              >
                공신력 있는 데이터
              </p>
              <h2
                id="trust-heading"
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                대입정보포털 adiga.kr 공식 데이터 기반
              </h2>
            </div>

            {/* 통계 3개 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(37, 99, 235, 0.08)", borderRadius: "20px", overflow: "hidden" }}>
              {/* 통계 1 */}
              <div
                className="text-center px-10 py-12"
                style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(8px)" }}
              >
                <div
                  className="stat-number text-5xl md:text-6xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {universities.length}
                  <span className="text-3xl md:text-4xl" style={{ color: "var(--brand-blue)" }}>개</span>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  수록 대학
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  주요 인서울 · 지방거점 국립대 포함
                </p>
              </div>

              {/* 통계 2 */}
              <div
                className="text-center px-10 py-12 relative"
                style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(8px)" }}
              >
                {/* 가운데 강조 효과 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.06), transparent 70%)" }}
                  aria-hidden="true"
                />
                <div
                  className="stat-number text-5xl md:text-6xl font-bold mb-3 relative"
                  style={{ color: "var(--text-primary)" }}
                >
                  {totalDepts.toLocaleString()}
                  <span className="text-3xl md:text-4xl" style={{ color: "var(--brand-blue)" }}>+</span>
                </div>
                <p className="text-sm font-medium relative" style={{ color: "var(--text-secondary)" }}>
                  학과 데이터
                </p>
                <p className="text-xs mt-1 relative" style={{ color: "var(--text-tertiary)" }}>
                  전공연계 핵심권장과목 포함
                </p>
              </div>

              {/* 통계 3 */}
              <div
                className="text-center px-10 py-12"
                style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(8px)" }}
              >
                <div
                  className="stat-number text-5xl md:text-6xl font-bold mb-3 text-gradient"
                >
                  2028
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  학년도 적용 기준
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  고교학점제 전면 시행 대비
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── 2028 대입 핵심 변화 (GAP 3) ── */}
        <section className="max-w-6xl mx-auto px-6 py-24" aria-labelledby="policy-heading">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--brand-blue)" }}
            >
              2028 대입 변화
            </p>
            <h2
              id="policy-heading"
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              2028학년도, 대입이 바뀝니다
            </h2>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              2025 고1부터 적용되는 핵심 변화를 확인하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 변화 1 */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--surface-glass)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(239, 68, 68, 0.1)" }}
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                수능 통합형 전환
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                국어·수학 선택과목 폐지, 탐구는 통합사회+통합과학 필수
              </p>
            </div>

            {/* 변화 2 */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--surface-glass)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(168, 85, 247, 0.1)" }}
              >
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                5등급 상대평가
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                기존 9등급에서 5등급으로 전환, 융합선택은 성취평가제(A~E)
              </p>
            </div>

            {/* 변화 3 */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--surface-glass)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(34, 197, 94, 0.1)" }}
              >
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                권장과목 제도
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                대학이 전공별 핵심권장/권장 과목 공식 지정, 미이수 시 불이익
              </p>
            </div>

            {/* 변화 4 */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--surface-glass)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(37, 99, 235, 0.1)" }}
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                정시 교과평가 확대
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                서울대 교과평가 40%로 확대, 정시도 교과 이수 내역이 합격 좌우
              </p>
            </div>
          </div>

          {/* 자세히 보기 링크 */}
          <div className="text-center mt-8">
            <Link
              href="/policy"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              style={{
                color: "var(--brand-blue)",
                background: "rgba(26, 86, 219, 0.08)",
                border: "1px solid rgba(26, 86, 219, 0.16)",
              }}
            >
              2028 대입 정책 자세히 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── 대학 목록 (권역별) ── */}
        <section className="max-w-6xl mx-auto px-6 py-24" aria-labelledby="universities-heading">

          {/* 섹션 헤더 */}
          <div className="text-center mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Coverage
            </p>
            <h2
              id="universities-heading"
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              수록 대학 ({universities.length}개교)
            </h2>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              대학명을 클릭하면 해당 대학의 학과별 권장과목을 확인할 수 있습니다.
            </p>
          </div>

          {/* 권역별 대학 카드 */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-1)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {regionOrder.filter((r) => regionGroups[r]).map((region, idx, arr) => (
              <div key={region}>
                {/* 권역 헤더 */}
                <div
                  className="px-8 py-5 flex items-center gap-3"
                  style={{
                    background: idx === 0 ? "var(--surface-2)" : undefined,
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    className={`region-badge text-sm font-bold ${regionColorMap[region] || "text-slate-500"}`}
                  >
                    {region}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--border-subtle)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {regionGroups[region].length}개교
                  </span>
                </div>

                {/* 대학 칩 목록 */}
                <div
                  className="px-8 py-6 flex flex-wrap gap-2"
                  style={{
                    borderBottom: idx < arr.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                  }}
                >
                  {regionGroups[region].map((name) => (
                    <Link
                      key={name}
                      href={`/university/${encodeURIComponent(name)}`}
                      className={`uni-chip px-3.5 py-1.5 text-sm font-medium rounded-full ${regionChipColorMap[region] || "hover:bg-blue-600 hover:text-white hover:border-blue-600"}`}
                      style={{
                        color: "var(--text-secondary)",
                        background: "var(--surface-glass)",
                        border: "1px solid var(--border-medium)",
                      }}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </section>
      </main>

      {/* ── 푸터 ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--surface-1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* 푸터 상단 */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            {/* 로고 + 설명 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--brand-blue)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 14L3 7M7 14V4M11 14V9M15 14V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  입시플래너
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                고교학점제 시대를 위한 전략적 교과 선택 가이드
              </p>
            </div>

            {/* 푸터 링크 */}
            <nav className="flex items-center gap-6" aria-label="푸터 네비게이션">
              <Link
                href="/guide"
                className="footer-link text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                교과 가이드
              </Link>
              <Link
                href="/search"
                className="footer-link text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                과목 검색
              </Link>
              <Link
                href="/policy"
                className="footer-link text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                2028 정책
              </Link>
              <Link
                href={`/university/${encodeURIComponent(universities[0] ?? "")}`}
                className="footer-link text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                대학 목록
              </Link>
            </nav>
          </div>

          {/* 구분선 */}
          <div className="divider-gradient mb-8" />

          {/* 푸터 하단 — 면책 조항 */}
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
