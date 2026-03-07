"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { CourseRecommendationData } from "@/lib/types";
import { optimizePortfolio, type PortfolioResult } from "@/lib/portfolio-optimizer";
import { analyzeRarity, type RarityResult } from "@/lib/rarity-analyzer";
import { getScoreGrade, GRADE_CONFIG } from "@/lib/gap-analysis";
import { normalizeSubject, categorizeSubject } from "@/lib/subject";
import SubjectSelector from "@/components/subject-selector";
import { Footer } from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import DesktopNav from "@/components/desktop-nav";
import AuthButton from "@/components/auth-button";

// ── Props 인터페이스 ──
interface Props {
  courseData: CourseRecommendationData;
  universities: string[];
  departmentMap: Record<string, string[]>;
  allSubjects: string[];
}

// ── 카테고리별 뱃지 색상 (비선택 상태) ──
const CATEGORY_BADGE: Record<string, string> = {
  수학: "bg-violet-100 text-violet-800 border-violet-200",
  과학: "bg-emerald-100 text-emerald-800 border-emerald-200",
  사회: "bg-amber-100 text-amber-800 border-amber-200",
  언어: "bg-rose-100 text-rose-800 border-rose-200",
  정보: "bg-cyan-100 text-cyan-800 border-cyan-200",
  기타: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function PortfolioClient({
  courseData,
  universities,
  departmentMap,
  allSubjects,
}: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  // ── 상태 ──
  const [targets, setTargets] = useState<{ university: string; department: string }[]>([]);
  const [currentUni, setCurrentUni] = useState("");
  const [currentDept, setCurrentDept] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [expandedRec, setExpandedRec] = useState<Set<number>>(new Set());
  const [rarityKeyword, setRarityKeyword] = useState("");

  // ── 대학/학과 가나다순 정렬 ──
  const sortedUniversities = useMemo(
    () => [...universities].sort((a, b) => a.localeCompare(b, "ko")),
    [universities]
  );
  const sortedDepartmentMap = useMemo(() => {
    const sorted: Record<string, string[]> = {};
    for (const [uni, depts] of Object.entries(departmentMap)) {
      sorted[uni] = [...depts].sort((a, b) => a.localeCompare(b, "ko"));
    }
    return sorted;
  }, [departmentMap]);

  // ── 포트폴리오 분석 결과 (useMemo로 캐싱) ──
  const portfolioResult: PortfolioResult | null = useMemo(() => {
    if (!showResults || targets.length < 2 || selectedCourses.size === 0) return null;
    return optimizePortfolio(courseData, {
      targets,
      currentCourses: Array.from(selectedCourses),
    });
  }, [showResults, targets, selectedCourses, courseData]);

  // ── 희소성 분석 결과 ──
  const rarityResult: RarityResult | null = useMemo(() => {
    if (!showResults || !rarityKeyword || selectedCourses.size === 0) return null;
    return analyzeRarity(courseData, Array.from(selectedCourses), rarityKeyword);
  }, [showResults, rarityKeyword, selectedCourses, courseData]);

  // ── 핸들러 ──
  function addTarget() {
    if (!currentUni || !currentDept) return;
    if (targets.length >= maxTargets) return;
    if (targets.some((t) => t.university === currentUni && t.department === currentDept)) return;
    setTargets([...targets, { university: currentUni, department: currentDept }]);
    setCurrentDept("");
    setShowResults(false);
  }

  function removeTarget(idx: number) {
    setTargets(targets.filter((_, i) => i !== idx));
    setShowResults(false);
  }

  const toggleCourse = useCallback(
    (subject: string) => {
      const next = new Set(selectedCourses);
      const normalized = normalizeSubject(subject);
      if (next.has(normalized)) next.delete(normalized);
      else next.add(normalized);
      setSelectedCourses(next);
      setShowResults(false);
    },
    [selectedCourses]
  );

  function runAnalysis() {
    if (targets.length < 2 || selectedCourses.size === 0) return;
    setShowResults(true);
  }

  function toggleRecExpand(idx: number) {
    setExpandedRec((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  // ── 단계 계산 ──
  const maxTargets = isLoggedIn ? 10 : 2;
  const canAnalyze = targets.length >= 2 && selectedCourses.size > 0;
  const currentStep = targets.length < 2 ? 1 : !showResults ? 2 : 3;

  // ── 본 기능 UI (비로그인도 체험 가능) ──
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* 헤더 */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--brand-blue)" }}
              >
                <svg width="18" height="18" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                  <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                  <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                  <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span
                className="text-base font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                입시연구소
              </span>
            </Link>
            <DesktopNav activePath="/portfolio" />
            <div className="flex items-center gap-2">
              <AuthButton />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
              style={{
                background: "rgba(26, 86, 219, 0.08)",
                color: "var(--brand-blue)",
                border: "1px solid rgba(26, 86, 219, 0.16)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
              최적 과목 조합 추천
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            전략 포트폴리오
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            목표 대학 2~10개를 동시에 고려한 최적 과목 조합을 찾아드립니다
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { step: 1, label: "목표 설정" },
            { step: 2, label: "과목 선택" },
            { step: 3, label: "포트폴리오 결과" },
          ].map(({ step, label }) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  background: currentStep >= step ? "var(--brand-blue)" : "var(--surface-2)",
                  color: currentStep >= step ? "white" : "var(--text-tertiary)",
                }}
              >
                {step}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{
                  color: currentStep >= step ? "var(--text-primary)" : "var(--text-tertiary)",
                }}
              >
                {label}
              </span>
              {step < 3 && (
                <div
                  className="w-8 h-px mx-1"
                  style={{
                    background: currentStep > step ? "var(--brand-blue)" : "var(--border-medium)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ═══ STEP 1: 목표 대학/학과 선택 (2~10개) ═══ */}
        <section
          className="rounded-2xl p-6 md:p-8 mb-6"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2"
              style={{ background: "var(--brand-blue)" }}
            >
              1
            </span>
            목표 대학 · 학과 선택
          </h2>
          <p className="text-xs mb-5 ml-8" style={{ color: "var(--text-tertiary)" }}>
            최소 2개, 최대 10개까지 선택할 수 있습니다
            {targets.length > 0 && (
              <span className="ml-2 font-semibold" style={{ color: "var(--brand-blue)" }}>
                {targets.length}개 선택됨
              </span>
            )}
          </p>

          {/* 선택된 목표 목록 — 필 형태 */}
          {targets.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 ml-8">
              {targets.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
                  style={{
                    background: "rgba(26, 86, 219, 0.08)",
                    color: "var(--brand-blue)",
                    border: "1px solid rgba(26, 86, 219, 0.16)",
                  }}
                >
                  {t.university} · {t.department}
                  <button
                    onClick={() => removeTarget(i)}
                    className="ml-1 hover:opacity-70"
                    aria-label={`${t.university} ${t.department} 삭제`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 최소 2개 안내 (1개만 선택된 경우) */}
          {targets.length === 1 && (
            <div
              className="ml-8 mb-4 rounded-xl p-3 flex items-center gap-2"
              style={{
                background: "rgba(245, 158, 11, 0.06)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                포트폴리오 분석을 위해 대학/학과를 1개 더 추가해 주세요
              </p>
            </div>
          )}

          {/* 추가 폼 (10개 미만일 때만 표시) */}
          {targets.length < 10 && (
            <div className="flex flex-col sm:flex-row gap-3 ml-8">
              <select
                value={currentUni}
                onChange={(e) => {
                  setCurrentUni(e.target.value);
                  setCurrentDept("");
                }}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border-medium)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">대학 선택</option>
                {sortedUniversities.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>

              <select
                value={currentDept}
                onChange={(e) => setCurrentDept(e.target.value)}
                disabled={!currentUni}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border-medium)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">학과 선택</option>
                {currentUni &&
                  sortedDepartmentMap[currentUni]?.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
              </select>

              <button
                onClick={addTarget}
                disabled={!currentUni || !currentDept}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                style={{ background: "var(--brand-blue)" }}
              >
                추가
              </button>
            </div>
          )}

          {/* 10개 도달 안내 */}
          {targets.length >= 10 && (
            <p className="text-xs ml-8 mt-2" style={{ color: "var(--text-tertiary)" }}>
              최대 10개를 선택했습니다. 기존 항목을 제거하면 새로 추가할 수 있습니다.
            </p>
          )}
        </section>

        {/* ═══ STEP 2: 현재 수강 과목 선택 ═══ */}
        <SubjectSelector
          allSubjects={allSubjects}
          selectedCourses={selectedCourses}
          onToggle={toggleCourse}
          showStepNumber={2}
          isActive={targets.length >= 2}
        />

        {/* 분석 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={runAnalysis}
            disabled={!canAnalyze}
            className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            style={{
              background: canAnalyze ? "var(--brand-blue)" : "var(--surface-2)",
              boxShadow: canAnalyze ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            포트폴리오 분석
          </button>
          {!canAnalyze && (
            <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
              {targets.length < 2
                ? "목표 대학/학과를 2개 이상 선택하세요"
                : "수강 과목을 선택하세요"}
            </p>
          )}
        </div>

        {/* ═══ STEP 3: 포트폴리오 분석 결과 ═══ */}
        {showResults && portfolioResult && (
          <section className="space-y-6" aria-label="포트폴리오 분석 결과">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                포트폴리오 분석 결과
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                선택한 {selectedCourses.size}개 과목 × {targets.length}개 목표 기준
              </p>
            </div>

            {/* ─── 1. 평균 적합도 게이지 ─── */}
            {(() => {
              const avg = portfolioResult.currentAvgScore;
              const grade = getScoreGrade(avg);
              const config = GRADE_CONFIG[grade];
              // SVG 원형 게이지: 반지름 54, 둘레 ~339.3
              const circumference = 2 * Math.PI * 54;
              const dashArray = `${(avg / 100) * circumference} ${circumference}`;

              return (
                <div
                  className="rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  {/* 원형 게이지 */}
                  <div className="relative w-36 h-36 shrink-0">
                    <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="54" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                      <circle
                        cx="64" cy="64" r="54"
                        fill="none" strokeWidth="8"
                        strokeDasharray={dashArray}
                        strokeLinecap="round"
                        className={
                          grade === "excellent"
                            ? "stroke-emerald-500"
                            : grade === "good"
                            ? "stroke-blue-500"
                            : grade === "warning"
                            ? "stroke-amber-500"
                            : "stroke-red-500"
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {avg}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>평균 점수</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full border ${config.bgColor} ${config.color} ${config.borderColor}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      목표 {targets.length}개 대학/학과의 평균 교과 적합도입니다
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                      아래 추천 과목을 수강하면 점수를 높일 수 있습니다
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* ─── 2. 각 목표별 점수 바 ─── */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h3 className="text-base font-bold mb-5" style={{ color: "var(--text-primary)" }}>
                목표별 적합도
              </h3>
              <div className="space-y-4">
                {portfolioResult.targetScores.map((result, idx) => {
                  const grade = getScoreGrade(result.coverageScore);
                  const config = GRADE_CONFIG[grade];
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {result.university}
                          <span className="ml-1 font-normal" style={{ color: "var(--text-secondary)" }}>
                            · {result.department}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${config.bgColor} ${config.color} ${config.borderColor}`}
                          >
                            {config.label}
                          </span>
                          <span
                            className="text-sm font-bold w-8 text-right"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {result.coverageScore}
                          </span>
                        </div>
                      </div>
                      {/* 점수 바 */}
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "var(--surface-2)" }}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${
                            grade === "excellent"
                              ? "bg-emerald-500"
                              : grade === "good"
                              ? "bg-blue-500"
                              : grade === "warning"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${result.coverageScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── 비로그인: 상세 분석 잠금 + 로그인 유도 ─── */}
            {!isLoggedIn && (
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: "rgba(26, 86, 219, 0.04)", border: "1px solid rgba(26, 86, 219, 0.12)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(26, 86, 219, 0.1)" }}>
                  <svg className="w-6 h-6" fill="none" stroke="var(--brand-blue)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <p className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  추천 과목 · 핵심과목 · 가성비 과목 분석
                </p>
                <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                  로그인하면 최대 10개 대학 동시 분석과 상세 추천을 확인할 수 있어요
                </p>
                <button
                  onClick={() => signIn()}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--brand-blue)", boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)" }}
                >
                  카카오 · 구글 간편 로그인
                </button>
              </div>
            )}

            {/* ─── 3. 추천 과목 TOP 5 (로그인 전용) ─── */}
            {isLoggedIn && portfolioResult.recommendations.length > 0 && (
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  추천 과목 TOP 5
                </h3>
                <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>
                  추가 수강 시 전체 평균 적합도가 가장 많이 오르는 과목입니다
                </p>
                <div className="space-y-3">
                  {portfolioResult.recommendations.slice(0, 5).map((rec, idx) => {
                    const cat = categorizeSubject(rec.subject);
                    const badgeColor = CATEGORY_BADGE[cat] ?? CATEGORY_BADGE["기타"];
                    const isExpanded = expandedRec.has(idx);
                    return (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden"
                        style={{ border: "1px solid var(--border-medium)" }}
                      >
                        {/* 과목 헤더 */}
                        <div
                          className="flex items-center justify-between px-4 py-3"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <div className="flex items-center gap-3">
                            {/* 순위 번호 */}
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: "var(--brand-blue)" }}
                            >
                              {idx + 1}
                            </span>
                            {/* 과목명 */}
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                              {rec.subject}
                            </span>
                            {/* 카테고리 뱃지 */}
                            <span
                              className={`hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-md border ${badgeColor}`}
                            >
                              {cat}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* 점수 상승폭 */}
                            <span className="text-sm font-bold text-emerald-600">
                              +{rec.impactScore.toFixed(1)}점
                            </span>
                            {/* 영향 학과 수 */}
                            <span className="text-xs hidden sm:inline" style={{ color: "var(--text-tertiary)" }}>
                              {rec.affectedTargets}/{targets.length} 학과
                            </span>
                            {/* 상세 펼치기 버튼 */}
                            {rec.targetDetails.length > 0 && (
                              <button
                                onClick={() => toggleRecExpand(idx)}
                                className="text-xs px-2 py-1 rounded-lg transition-colors hover:opacity-70"
                                style={{
                                  background: "rgba(26, 86, 219, 0.08)",
                                  color: "var(--brand-blue)",
                                }}
                                aria-expanded={isExpanded}
                              >
                                {isExpanded ? "접기" : "상세"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 펼쳐진 상세: 영향받는 목표 목록 */}
                        {isExpanded && rec.targetDetails.length > 0 && (
                          <div
                            className="px-4 py-3 space-y-2"
                            style={{ borderTop: "1px solid var(--border-subtle)" }}
                          >
                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                              영향받는 목표 학과
                            </p>
                            {rec.targetDetails.map((detail, di) => (
                              <div key={di} className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded-md border ${
                                    detail.type === "core"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}
                                >
                                  {detail.type === "core" ? "핵심권장" : "권장"}
                                </span>
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                  {detail.university} · {detail.department}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── 4. 공통 핵심과목 (로그인 전용) ─── */}
            {isLoggedIn && portfolioResult.commonCore.length > 0 && (
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: "rgba(239, 68, 68, 0.04)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-base font-bold text-red-700">공통 핵심과목</h3>
                </div>
                <p className="text-xs mb-4 text-red-600">
                  목표 대학의 80% 이상이 요구하는 핵심권장과목입니다. 반드시 수강하세요.
                </p>
                <div className="flex flex-wrap gap-2">
                  {portfolioResult.commonCore.map((subject) => {
                    const cat = categorizeSubject(subject);
                    const badgeColor = CATEGORY_BADGE[cat] ?? CATEGORY_BADGE["기타"];
                    return (
                      <span
                        key={subject}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg border ${badgeColor}`}
                      >
                        {subject}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── 5. 가성비 과목 (로그인 전용) ─── */}
            {isLoggedIn && portfolioResult.leverageSubjects.length > 0 && (
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: "rgba(16, 185, 129, 0.04)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-base font-bold text-emerald-700">가성비 과목</h3>
                </div>
                <p className="text-xs mb-4 text-emerald-600">
                  3개 이상의 목표 학과에 동시에 영향을 주는 효율 높은 과목입니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  {portfolioResult.leverageSubjects.map((subject) => {
                    const cat = categorizeSubject(subject);
                    const badgeColor = CATEGORY_BADGE[cat] ?? CATEGORY_BADGE["기타"];
                    return (
                      <span
                        key={subject}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg border ${badgeColor}`}
                      >
                        {subject}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── 추천 과목이 없는 경우 ─── */}
            {isLoggedIn && portfolioResult.recommendations.length === 0 && (
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <svg className="w-12 h-12 mx-auto mb-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base font-semibold text-emerald-700 mb-1">완벽한 포트폴리오!</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  모든 목표 대학의 권장과목을 이미 이수했습니다.
                </p>
              </div>
            )}

            {/* ─── 6. 희소성 분석 ─── */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                과목 조합 희소성 분석
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
                특정 학과군에서 내 과목 조합이 얼마나 희소한지 분석합니다
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={rarityKeyword}
                  onChange={(e) => setRarityKeyword(e.target.value)}
                  placeholder="학과 키워드 (예: 컴퓨터, 경영, 기계)"
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-300"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border-medium)", color: "var(--text-primary)" }}
                />
              </div>

              {rarityResult && rarityResult.matchedDepts > 0 && (
                <div className="space-y-4">
                  {/* 희소성 점수 */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0"
                      style={{
                        background: rarityResult.uniquenessScore >= 60 ? "rgba(16, 185, 129, 0.1)" : rarityResult.uniquenessScore >= 30 ? "rgba(245, 158, 11, 0.1)" : "rgba(107, 114, 128, 0.1)",
                        border: `1px solid ${rarityResult.uniquenessScore >= 60 ? "rgba(16, 185, 129, 0.2)" : rarityResult.uniquenessScore >= 30 ? "rgba(245, 158, 11, 0.2)" : "rgba(107, 114, 128, 0.2)"}`,
                      }}
                    >
                      <span className={`text-xl font-bold ${rarityResult.uniquenessScore >= 60 ? "text-emerald-600" : rarityResult.uniquenessScore >= 30 ? "text-amber-600" : "text-gray-500"}`}>
                        {rarityResult.uniquenessScore}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>희소성</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {rarityResult.keyword} 계열 {rarityResult.matchedDepts}개 학과 중
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        희소 과목 {rarityResult.rareSubjects.length}개 보유
                      </p>
                    </div>
                  </div>

                  {/* 희소 과목 목록 */}
                  {rarityResult.rareSubjects.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2 text-emerald-700">희소 과목 (추천 비율 20% 미만)</p>
                      <div className="space-y-2">
                        {rarityResult.rareSubjects.map((s) => (
                          <div
                            key={s.subject}
                            className="rounded-xl p-3"
                            style={{ background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.15)" }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                {s.subject}
                              </span>
                              <span className="text-xs font-bold text-emerald-600">
                                추천 비율 {s.mentionRate}%
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {s.positioningTip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 보편 과목 */}
                  {rarityResult.commonSubjects.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>보편 과목 (추천 비율 20% 이상)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rarityResult.commonSubjects.map((s) => (
                          <span
                            key={s.subject}
                            className="px-2.5 py-1 text-xs rounded-lg"
                            style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                          >
                            {s.subject} ({s.mentionRate}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {rarityResult && rarityResult.matchedDepts === 0 && rarityKeyword && (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-tertiary)" }}>
                  &quot;{rarityKeyword}&quot; 관련 학과를 찾지 못했습니다. 다른 키워드를 시도해보세요.
                </p>
              )}
            </div>

            {/* 면책 조항 */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                본 분석은 대교협 adiga.kr 및 각 대학 입학처 공식 자료를 기반으로 한 참고용 정보입니다.
                <br />
                정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처를 통해 확인하시기 바랍니다.
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
