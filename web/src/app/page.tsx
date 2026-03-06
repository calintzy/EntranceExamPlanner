import Link from "next/link";
import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getUniversityList } from "@/lib/course-utils";
import universityMeta from "@/lib/university_meta.json";
import MobileNav from "@/components/mobile-nav";

/* ── 메타데이터 ── */
export const metadata: Metadata = {
  title: "입시플래너 — 2028 대학별 권장과목 비교 · 역방향 검색",
  description:
    "전국 49개 대학의 전공연계 핵심권장과목을 한눈에 비교하고, 내가 선택한 과목으로 유리한 대학을 찾아보세요. adiga.kr 공식 데이터 기반 무료 서비스.",
  openGraph: {
    title: "입시플래너 — 2028 대학별 권장과목 비교 · 역방향 검색",
    description:
      "전국 49개 대학의 전공연계 핵심권장과목을 한눈에 비교하세요.",
  },
};

/* ── 빌드 타임 데이터 ── */
const universities = getUniversityList(courseData);
const totalDepts = Object.values(courseData).reduce(
  (sum, depts) => sum + Object.keys(depts).length,
  0
);

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

const regionColorMap: Record<string, string> = {
  "주요 대학": "text-blue-600",
  수도권: "text-indigo-600",
  중부권: "text-emerald-600",
  영남권: "text-amber-600",
  호남권: "text-violet-600",
};

const regionChipColorMap: Record<string, string> = {
  "주요 대학": "hover:bg-blue-600 hover:text-white hover:border-blue-600",
  수도권: "hover:bg-indigo-600 hover:text-white hover:border-indigo-600",
  중부권: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
  영남권: "hover:bg-amber-600 hover:text-white hover:border-amber-600",
  호남권: "hover:bg-violet-600 hover:text-white hover:border-violet-600",
};

/* ── 비교 사례 데이터 (빌드 타임) ── */
function findComparisonExample() {
  const pairs = [
    { uni1: "서울대", uni2: "연세대" },
    { uni1: "서울대", uni2: "고려대" },
    { uni1: "연세대", uni2: "고려대" },
  ];
  const keywords = [
    { terms: ["컴퓨터", "소프트웨어"], label: "컴퓨터·SW 계열" },
    { terms: ["경영"], label: "경영학 계열" },
    { terms: ["경제"], label: "경제학 계열" },
    { terms: ["기계"], label: "기계공학 계열" },
    { terms: ["전기", "전자"], label: "전기·전자공학 계열" },
    { terms: ["화학"], label: "화학 계열" },
    { terms: ["생명", "바이오"], label: "생명과학 계열" },
  ];

  for (const { uni1, uni2 } of pairs) {
    const d1 = courseData[uni1];
    const d2 = courseData[uni2];
    if (!d1 || !d2) continue;

    for (const { terms, label } of keywords) {
      const dept1 = Object.keys(d1).find((d) =>
        terms.some((t) => d.includes(t))
      );
      const dept2 = Object.keys(d2).find((d) =>
        terms.some((t) => d.includes(t))
      );

      if (dept1 && dept2) {
        const data1 = d1[dept1];
        const data2 = d2[dept2];
        if (data1.core !== data2.core) {
          const splitSubjects = (s: string) =>
            s ? s.split(/[,，]\s*/).map((x) => x.trim()).filter(Boolean).slice(0, 5) : [];
          return {
            label,
            items: [
              { uni: uni1, dept: dept1, core: splitSubjects(data1.core), recommended: splitSubjects(data1.recommended) },
              { uni: uni2, dept: dept2, core: splitSubjects(data2.core), recommended: splitSubjects(data2.recommended) },
            ],
          };
        }
      }
    }
  }
  return null;
}

const comparison = findComparisonExample();

/* ── JSON-LD ── */
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

/* ── FAQ 데이터 ── */
const faqItems = [
  {
    q: "데이터는 어디서 가져오나요?",
    a: "대입정보포털 adiga.kr(한국대학교육협의회 운영)의 공식 발표 자료와 각 대학 입학처 모집요강을 기반으로 합니다. 다만 참고용 정보이므로, 최종 확인은 반드시 각 대학 입학처를 통해 하시길 권장합니다.",
  },
  {
    q: "어떤 대학들의 정보가 포함되어 있나요?",
    a: `서울대, 연세대, 고려대 등 주요 인서울 대학부터 부산대, 경북대, 전남대 등 지방거점 국립대까지 전국 ${universities.length}개 대학의 정보를 수록하고 있으며, 지속적으로 확대하고 있습니다.`,
  },
  {
    q: "2028학년도 이전 입시에도 활용할 수 있나요?",
    a: "2028학년도(2025년 고1부터 적용) 기준 데이터를 중심으로, 2026학년도 주요 대학 데이터도 함께 제공합니다. 고교학점제 전면 시행에 대비한 교과 선택 전략 수립에 활용하세요.",
  },
  {
    q: "데이터는 얼마나 자주 업데이트되나요?",
    a: "대교협 및 각 대학의 공식 발표에 따라 주기적으로 업데이트됩니다. 2028학년도 기준 데이터는 대교협이 2024년에 발표한 자료를 기반으로 합니다.",
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
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 14L3 7M7 14V4M11 14V9M15 14V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                입시플래너
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1" aria-label="메인 네비게이션">
              <Link href="/guide" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>
                교과 가이드
              </Link>
              <Link href="/search" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>
                과목 검색
              </Link>
              <Link href="/policy" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>
                2028 정책
              </Link>
              <Link href="/contract" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>
                계약학과
              </Link>
              <span
                className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-full badge-live"
                style={{ background: "rgba(26, 86, 219, 0.1)", color: "var(--brand-blue-light)", border: "1px solid rgba(26, 86, 219, 0.2)" }}
              >
                2026 · 2028
              </span>
            </nav>

            <MobileNav />
          </div>
        </div>
      </header>

      <main>
        {/* ═══════════════════════════════════════
            2. 히어로 — 불안 해소형
           ═══════════════════════════════════════ */}
        <section className="hero-grid-bg relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="hero-blob-1" aria-hidden="true" />
          <div className="hero-blob-2" aria-hidden="true" />

          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-20 text-center">
            {/* 상단 배지 */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
                style={{ background: "rgba(26, 86, 219, 0.08)", color: "var(--brand-blue)", border: "1px solid rgba(26, 86, 219, 0.16)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
                adiga.kr 공식 데이터 기반 · 무료 서비스
              </span>
            </div>

            {/* 메인 헤딩 — 불안 해소형 */}
            <h1
              id="hero-heading"
              className="animate-fade-in-up-delay-1 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              2028 대입,
              <br />
              <span className="text-gradient">무엇부터 준비</span>해야 할지
              <br />
              막막하신가요?
            </h1>

            {/* 서브 헤딩 — 해결책 제시 */}
            <p
              className="animate-fade-in-up-delay-2 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              전국 {universities.length}개 대학의 전공연계 핵심권장과목을 한눈에 비교하고,
              <br className="hidden md:block" />
              내가 선택한 과목으로 어떤 대학에 유리한지 바로 확인하세요.
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/guide"
                className="btn-glow inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl"
                style={{ background: "var(--brand-blue)" }}
              >
                교과 선택 가이드
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl transition-all hover:-translate-y-0.5"
                style={{
                  color: "var(--text-primary)",
                  background: "var(--surface-glass)",
                  border: "1px solid var(--border-medium)",
                  backdropFilter: "blur(16px)",
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
            3. 신뢰 스트립 — 숫자 + 근거
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
            4. 30초 사용법 — 3단계
           ═══════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-24" aria-labelledby="howto-heading">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
              How it works
            </p>
            <h2 id="howto-heading" className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              30초면 충분합니다
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* 스텝 1 */}
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

            {/* 스텝 2 */}
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

            {/* 스텝 3 */}
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
            5. 핵심 기능 3종
           ═══════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 pb-24" aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">주요 기능</h2>

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
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
                핵심 기능 01
              </div>
              <h3 className="text-lg font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>
                핵심권장과목 확인
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
                대학이 공식 지정한 전공연계 핵심권장과목을 학과별로 확인하세요. 미이수 시 불이익이 있는 과목을 놓치지 마세요.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--brand-blue)" }}>
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
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#059669" }}>
                핵심 기능 02
              </div>
              <h3 className="text-lg font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>
                대학간 비교
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
                같은 학과라도 대학마다 요구하는 과목이 다릅니다. {universities.length}개 대학을 나란히 놓고 차이를 한눈에 파악하세요.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#059669" }}>
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
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#d97706" }}>
                핵심 기능 03
              </div>
              <h3 className="text-lg font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>
                역방향 검색
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
                내가 선택한 과목을 입력하면, 해당 과목을 핵심권장하는 대학과 학과를 자동으로 찾아줍니다.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#d97706" }}>
                과목으로 찾기
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            6. 실제 비교 사례 (NEW)
           ═══════════════════════════════════════ */}
        {comparison && (
          <section className="max-w-6xl mx-auto px-6 pb-24" aria-labelledby="comparison-heading">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
                실제 비교 사례
              </p>
              <h2 id="comparison-heading" className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                같은 계열이라도 대학마다 다릅니다
              </h2>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                {comparison.label} — 두 대학의 권장과목 차이를 확인해보세요
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 relative">
              {/* VS 배지 (데스크톱) */}
              <div className="comparison-vs hidden md:flex" aria-hidden="true">VS</div>

              {comparison.items.map((item, idx) => (
                <div key={item.uni} className="comparison-card p-6">
                  {/* 대학 헤더 */}
                  <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: idx === 0 ? "var(--brand-blue)" : "#6366f1" }}
                    >
                      {item.uni.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{item.uni}</div>
                      <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{item.dept}</div>
                    </div>
                  </div>

                  {/* 핵심권장 */}
                  {item.core.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span style={{ color: "var(--text-secondary)" }}>핵심권장과목</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.core.map((s) => (
                          <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 권장 */}
                  {item.recommended.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span style={{ color: "var(--text-secondary)" }}>권장과목</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.recommended.map((s) => (
                          <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 모바일 VS */}
              <div className="comparison-vs md:hidden" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} aria-hidden="true">VS</div>
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                style={{ color: "var(--brand-blue)", background: "rgba(26, 86, 219, 0.08)", border: "1px solid rgba(26, 86, 219, 0.16)" }}
              >
                직접 비교해보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            7. 2028 대입 변화 — "왜 지금 필요한가"
           ═══════════════════════════════════════ */}
        <section className="trust-section py-20 md:py-24" aria-labelledby="policy-heading">
          <div className="trust-section-glow" aria-hidden="true" />
          <div className="relative max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
                왜 지금 교과 선택이 중요한가요?
              </p>
              <h2 id="policy-heading" className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                2028학년도, 대입의 판도가 바뀝니다
              </h2>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                2025년 고1부터 적용 — 지금 준비하지 않으면 늦습니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 변화 1 */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>수능 통합형 전환</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  국어·수학 선택과목 폐지, 탐구는 통합사회+통합과학 필수
                </p>
              </div>

              {/* 변화 2 */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(168, 85, 247, 0.1)" }}>
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>5등급 상대평가</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  기존 9등급에서 5등급으로 전환, 융합선택은 성취평가제(A~E)
                </p>
              </div>

              {/* 변화 3 */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(34, 197, 94, 0.1)" }}>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>권장과목 제도</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  대학이 전공별 핵심권장·권장 과목 공식 지정, 미이수 시 불이익 가능
                </p>
              </div>

              {/* 변화 4 */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(37, 99, 235, 0.1)" }}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>정시 교과평가 확대</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  서울대 교과평가 40%로 확대, 정시도 교과 이수 내역이 합격 좌우
                </p>
              </div>
            </div>

            {/* 결론 + 링크 */}
            <div className="text-center mt-10">
              <p className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary)" }}>
                이 모든 변화 속에서, <strong style={{ color: "var(--brand-blue)" }}>입시플래너</strong>가 가장 명확한 교과 선택 길잡이가 되어드립니다.
              </p>
              <Link
                href="/policy"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                style={{ color: "var(--brand-blue)", background: "rgba(26, 86, 219, 0.08)", border: "1px solid rgba(26, 86, 219, 0.16)" }}
              >
                2028 대입 정책 자세히 보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            8. 대학 목록 (compact)
           ═══════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-24" aria-labelledby="universities-heading">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
              Coverage
            </p>
            <h2 id="universities-heading" className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              수록 대학 ({universities.length}개교)
            </h2>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              대학명을 클릭하면 학과별 권장과목을 확인할 수 있습니다
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border-subtle)", background: "var(--surface-1)", boxShadow: "var(--shadow-card)" }}
          >
            {regionOrder.filter((r) => regionGroups[r]).map((region, idx, arr) => (
              <div key={region}>
                <div
                  className="px-6 md:px-8 py-4 flex items-center gap-3"
                  style={{
                    background: idx === 0 ? "var(--surface-2)" : undefined,
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span className={`region-badge text-sm font-bold ${regionColorMap[region] || "text-slate-500"}`}>
                    {region}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "var(--border-subtle)", color: "var(--text-tertiary)" }}
                  >
                    {regionGroups[region].length}개교
                  </span>
                </div>

                <div
                  className="px-6 md:px-8 py-5 flex flex-wrap gap-2"
                  style={{ borderBottom: idx < arr.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
                >
                  {regionGroups[region].map((name) => (
                    <Link
                      key={name}
                      href={`/university/${encodeURIComponent(name)}`}
                      className={`uni-chip px-3 py-1.5 text-sm font-medium rounded-full ${regionChipColorMap[region] || "hover:bg-blue-600 hover:text-white hover:border-blue-600"}`}
                      style={{ color: "var(--text-secondary)", background: "var(--surface-glass)", border: "1px solid var(--border-medium)" }}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            9. FAQ
           ═══════════════════════════════════════ */}
        <section className="max-w-3xl mx-auto px-6 pb-24" aria-labelledby="faq-heading">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-blue)" }}>
              FAQ
            </p>
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              자주 묻는 질문
            </h2>
          </div>

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
            10. 최종 CTA
           ═══════════════════════════════════════ */}
        <section className="final-cta-section py-20 md:py-24" aria-labelledby="final-cta-heading">
          <div className="final-cta-glow" aria-hidden="true" />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <h2 id="final-cta-heading" className="text-2xl md:text-3xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-base text-blue-200 mb-8 leading-relaxed">
              우리 아이에게 맞는 교과 선택,
              <br className="md:hidden" />
              입시플래너와 함께 준비하세요.
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
          11. 푸터
         ═══════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                  <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3 14L3 7M7 14V4M11 14V9M15 14V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>입시플래너</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                고교학점제 시대를 위한 전략적 교과 선택 가이드
              </p>
            </div>

            <nav className="flex items-center gap-6" aria-label="푸터 네비게이션">
              <Link href="/guide" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>교과 가이드</Link>
              <Link href="/search" className="footer-link text-sm" style={{ color: "var(--text-tertiary)" }}>과목 검색</Link>
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
