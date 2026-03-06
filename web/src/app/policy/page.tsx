import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { BASE_URL, UNIVERSITY_COUNT } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "2028 대입 정책 종합 가이드 | 입시연구소",
  description:
    "2028학년도 대입 핵심 변화를 한눈에 정리. 2022 개정 교육과정 선택과목 체계, 수능 통합형 전환, 고교학점제, 권장과목 제도, 정시 교과평가 확대까지.",
  openGraph: {
    title: "2028 대입 정책 종합 가이드",
    description:
      "수능 통합형, 5등급 상대평가, 권장과목 제도 등 2028 대입 핵심 변화 총정리",
  },
};

export default function PolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* 헤더 — 랜딩과 동일한 글래스 스타일 */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 14L3 7M7 14V4M11 14V9M15 14V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  입시연구소
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/guide" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>
                교과 가이드
              </Link>
              <Link href="/search" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>
                과목 검색
              </Link>
              <span
                className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-full"
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  color: "#7c3aed",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                2028 정책
              </span>
            </nav>
          </div>
        </div>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "2028 수능은 어떻게 바뀌나요?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "2028 수능은 국어·수학 선택과목이 폐지되고 통합 출제됩니다. 탐구영역은 통합사회와 통합과학 2과목 필수 응시로 변경됩니다.",
                },
              },
              {
                "@type": "Question",
                name: "권장과목이란 무엇인가요?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "대학이 전공별로 핵심권장과목과 권장과목을 공식 지정하는 제도입니다. 미이수 시 학종 서류평가와 정시 교과평가에서 불이익이 있을 수 있습니다.",
                },
              },
              {
                "@type": "Question",
                name: "고교학점제란 무엇인가요?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "2025년부터 전면 시행되는 제도로, 학생이 진로에 맞춰 과목을 직접 선택합니다. 192학점(수업 174 + 창체 18) 이수가 졸업 기준이며, 과목별 성취율 40% 이상이 필요합니다.",
                },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "홈", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "2028 대입 정책 가이드" },
            ],
          }),
        }}
      />

      <main>
        {/* 히어로 섹션 */}
        <section className="policy-hero relative overflow-hidden">
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="animate-fade-in-up inline-flex items-center gap-2 mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
                style={{
                  background: "rgba(139, 92, 246, 0.08)",
                  color: "#7c3aed",
                  border: "1px solid rgba(139, 92, 246, 0.16)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
                2025년 고1부터 적용
              </span>
            </div>
            <h1
              className="animate-fade-in-up-delay-1 text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              2028학년도 대입
              <br />
              <span className="text-gradient">이렇게 바뀝니다</span>
            </h1>
            <p
              className="animate-fade-in-up-delay-2 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              수능 선택과목 폐지 + 고교학점제 + 권장과목 제도
              <br className="hidden md:block" />
              <strong style={{ color: "var(--text-primary)" }}>&ldquo;내가 무엇을 선택해서 공부했는가&rdquo;</strong>가 합격을 좌우합니다.
            </p>
          </div>
        </section>

        {/* 콘텐츠 */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="space-y-8">

            {/* 네비게이션 */}
            <nav className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              <Link href="/" className="footer-link" style={{ color: "var(--text-tertiary)" }}>홈</Link>
              <span className="mx-2">/</span>
              <span style={{ color: "var(--text-primary)" }} className="font-medium">2028 대입 정책 가이드</span>
            </nav>

            {/* 1. 선택과목 체계 */}
            <div className="policy-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(139, 92, 246, 0.1)", color: "#7c3aed" }}
                >1</span>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  선택과목 체계 — 4단계 재편
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                2022 개정 교육과정으로 선택과목이 4단계로 재편됩니다. 과목 유형에 따라 내신 평가 방식이 다릅니다.
              </p>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>구분</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>성격</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>예시</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>내신 평가</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="px-4 py-3"><span className="level-badge inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">공통과목</span></td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>모든 학생 필수 이수</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>공통국어, 공통수학, 통합사회, 통합과학</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>5등급 상대평가</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="px-4 py-3"><span className="level-badge inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">일반선택</span></td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>교양/기본 심화</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>대수, 미적분I, 물리학, 화학, 한국지리</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>5등급 상대평가</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="px-4 py-3"><span className="level-badge inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">진로선택</span></td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>전공 연계 심화</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>미적분II, 기하, 물리학II, 화학II</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>5등급 상대평가</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="level-badge inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-200">융합선택</span>
                        <span className="ml-1 text-[10px]" style={{ color: "#0d9488" }}>(신설)</span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>교과 간 융합</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>여행지리, 기후변화와 지속가능한 세계</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#0d9488" }}>성취평가제 (A~E)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. 수능 변화 */}
            <div className="policy-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}
                >2</span>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  수능 통합형 전환
                </h2>
              </div>
              <div
                className="rounded-xl p-4 mb-5"
                style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>
                  가장 큰 변화: 국어·수학 선택과목 전면 폐지, 탐구 통합 필수
                </p>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>영역</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>현행 (2025~2027)</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>2028 변경</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["국어", "화법과작문/언어와매체 선택", "선택 폐지, 통합 출제 (45문항 80분)"],
                      ["수학", "확통/미적분/기하 선택", "선택 폐지, 통합 출제 (30문항 100분)"],
                      ["탐구", "사탐/과탐 17개 중 2과목 선택", "통합사회 + 통합과학 2과목 필수"],
                      ["탐구 시간", "과목당 30분, 20문항", "과목당 40분, 25문항"],
                    ].map(([area, current, change], i) => (
                      <tr key={area} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{area}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-tertiary)" }}>{current}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{change}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>시행일</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-tertiary)" }}>—</td>
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--brand-blue)" }}>2027년 11월 18일</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. 고교학점제 */}
            <div className="policy-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}
                >3</span>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  고교학점제 전면 시행
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div
                  className="rounded-xl p-5"
                  style={{ background: "rgba(34, 197, 94, 0.04)", border: "1px solid rgba(34, 197, 94, 0.12)" }}
                >
                  <div className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>졸업 기준</div>
                  <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                    192<span className="text-xl" style={{ color: "#16a34a" }}>학점</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>수업 174학점 + 창체 18학점</div>
                </div>
                <div
                  className="rounded-xl p-5"
                  style={{ background: "rgba(34, 197, 94, 0.04)", border: "1px solid rgba(34, 197, 94, 0.12)" }}
                >
                  <div className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>성취 기준</div>
                  <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                    40<span className="text-xl" style={{ color: "#16a34a" }}>%</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>미만 시 보충과정 이수 후 재평가</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                학생이 자신의 진로에 맞춰 과목을 직접 선택합니다.
                <strong style={{ color: "var(--text-primary)" }}> 어떤 과목을 선택했는지</strong>가 대입의 핵심 평가 요소가 됩니다.
              </p>
            </div>

            {/* 4. 권장과목 제도 */}
            <div className="policy-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" }}
                >4</span>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  대학별 권장과목 제도
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                대교협이 adiga.kr을 통해 <strong style={{ color: "var(--text-primary)" }}>{UNIVERSITY_COUNT}개 대학</strong>의 전공별 권장과목을 공개합니다.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div
                  className="rounded-xl p-5"
                  style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.12)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
                    <span className="text-sm font-bold" style={{ color: "#dc2626" }}>핵심권장과목</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    해당 전공에 반드시 이수를 권장. 미이수 시 정성평가에서 불이익.
                  </p>
                </div>
                <div
                  className="rounded-xl p-5"
                  style={{ background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.12)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#2563eb" }} />
                    <span className="text-sm font-bold" style={{ color: "#2563eb" }}>권장과목</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    이수하면 유리한 과목. 이수 시 가점 요소.
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>주요 계열별 핵심권장 예시</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <th className="px-4 py-2 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>계열</th>
                      <th className="px-4 py-2 text-left font-semibold" style={{ color: "var(--text-primary)", background: "rgba(0,0,0,0.02)" }}>핵심권장과목</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["공학계열", "미적분II, 물리학, 화학"],
                      ["의학계열", "생명과학, 화학, 미적분II"],
                      ["수학/통계", "미적분, 확률과통계, 기하"],
                      ["인문계열", "제2외국어/한문 1과목 이상"],
                    ].map(([field, subjects]) => (
                      <tr key={field} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td className="px-4 py-2.5 font-medium" style={{ color: "var(--text-primary)" }}>{field}</td>
                        <td className="px-4 py-2.5" style={{ color: "var(--text-secondary)" }}>{subjects}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/guide"
                  className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
                  style={{ background: "var(--brand-blue)" }}
                >
                  대학별 권장과목 확인하기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                  style={{
                    color: "var(--brand-blue)",
                    background: "rgba(37, 99, 235, 0.06)",
                    border: "1px solid rgba(37, 99, 235, 0.15)",
                  }}
                >
                  내 과목으로 대학 찾기
                </Link>
              </div>
            </div>

            {/* 5. 정시 교과평가 */}
            <div className="policy-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}
                >5</span>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  정시 교과평가 — 수능만으로는 부족
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                2028 정시에서 학생부 정성평가가 확대되는 대전환이 일어납니다.
              </p>
              <div className="space-y-3">
                {[
                  { univ: "서울대", desc: "수능 60% + 교과평가", highlight: "40%", change: "기존 20% → 40%로 2배 확대", color: "#dc2626" },
                  { univ: "경희대", desc: "정시에도 학생부 평가 도입 예고", highlight: null, change: "신규", color: "#2563eb" },
                  { univ: "건국대", desc: "정시 학생부 반영 예고", highlight: null, change: "신규", color: "#2563eb" },
                ].map((item) => (
                  <div key={item.univ} className="eval-box rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item.univ}</span>
                        <span className="text-sm ml-2" style={{ color: "var(--text-secondary)" }}>
                          {item.desc}
                          {item.highlight && (
                            <strong className="ml-1" style={{ color: item.color }}>{item.highlight}</strong>
                          )}
                        </span>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: `${item.color}10`, color: item.color, border: `1px solid ${item.color}25` }}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA 배너 */}
            <div
              className="rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)" }}
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative">
                <p className="text-xl md:text-2xl font-bold text-white mb-3">
                  2028 대입 = &ldquo;내가 무엇을 선택해서 공부했는가&rdquo;의 시대
                </p>
                <p className="text-sm text-blue-100 max-w-2xl mx-auto mb-6">
                  수능 선택과목 폐지 + 고교학점제 + 권장과목 제도 → 교과 선택이 곧 입시 전략
                </p>
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                >
                  지금 바로 권장과목 확인하기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* 출처 */}
            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>데이터 출처</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)", opacity: 0.75 }}>
                대입정보포털 adiga.kr (대교협) · 각 대학 입학처 모집요강
              </p>
              <p className="text-xs font-medium mt-2" style={{ color: "var(--text-tertiary)" }}>정책 참고</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)", opacity: 0.75 }}>
                대한민국 정책브리핑 · 서울대 입학본부
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
