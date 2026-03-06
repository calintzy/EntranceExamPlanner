"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { CourseRecommendationData } from "@/lib/types";
import { analyzeGap, getScoreGrade, GRADE_CONFIG, type GapAnalysisResult } from "@/lib/gap-analysis";
import { categorizeSubject, isValidSubject, normalizeSubject } from "@/lib/subject";
import { Footer } from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import AuthButton from "@/components/auth-button";

interface Props {
  courseData: CourseRecommendationData;
  universities: string[];
  departmentMap: Record<string, string[]>;
  allSubjects: string[];
}

// ── 과목 카테고리 그룹핑 ──
function groupByCategory(subjects: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const s of subjects) {
    if (!isValidSubject(s)) continue;
    const cat = categorizeSubject(s);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  }
  return groups;
}

const CATEGORY_ORDER = ["수학", "과학", "사회", "언어", "정보", "기타"];
const CATEGORY_COLORS: Record<string, string> = {
  수학: "border-violet-300 bg-violet-50 text-violet-800",
  과학: "border-emerald-300 bg-emerald-50 text-emerald-800",
  사회: "border-amber-300 bg-amber-50 text-amber-800",
  언어: "border-rose-300 bg-rose-50 text-rose-800",
  정보: "border-cyan-300 bg-cyan-50 text-cyan-800",
  기타: "border-slate-300 bg-slate-50 text-slate-800",
};
const CATEGORY_SELECTED: Record<string, string> = {
  수학: "border-violet-500 bg-violet-600 text-white",
  과학: "border-emerald-500 bg-emerald-600 text-white",
  사회: "border-amber-500 bg-amber-600 text-white",
  언어: "border-rose-500 bg-rose-600 text-white",
  정보: "border-cyan-500 bg-cyan-600 text-white",
  기타: "border-slate-500 bg-slate-600 text-white",
};

export default function StrategyClient({ courseData, universities, departmentMap, allSubjects }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const maxTargets = isLoggedIn ? 3 : 1;

  // ── 상태 ──
  const [targets, setTargets] = useState<{ university: string; department: string }[]>([]);
  const [currentUni, setCurrentUni] = useState("");
  const [currentDept, setCurrentDept] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // ── 대학/학과 가나다순 정렬 ──
  const sortedUniversities = useMemo(() => [...universities].sort((a, b) => a.localeCompare(b, "ko")), [universities]);
  const sortedDepartmentMap = useMemo(() => {
    const sorted: Record<string, string[]> = {};
    for (const [uni, depts] of Object.entries(departmentMap)) {
      sorted[uni] = [...depts].sort((a, b) => a.localeCompare(b, "ko"));
    }
    return sorted;
  }, [departmentMap]);

  // ── 과목 그룹 ──
  const subjectGroups = useMemo(() => groupByCategory(allSubjects), [allSubjects]);

  // ── 카테고리 아코디언 토글 ──
  const toggleCategory = useCallback((cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  // ── 갭 분석 결과 ──
  const results: GapAnalysisResult[] = useMemo(() => {
    if (!showResults || targets.length === 0 || selectedCourses.size === 0) return [];
    return analyzeGap(courseData, {
      targetUniversities: targets,
      currentCourses: Array.from(selectedCourses),
    });
  }, [showResults, targets, selectedCourses, courseData]);

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

  function toggleCourse(subject: string) {
    const next = new Set(selectedCourses);
    const normalized = normalizeSubject(subject);
    if (next.has(normalized)) next.delete(normalized);
    else next.add(normalized);
    setSelectedCourses(next);
    setShowResults(false);
  }

  function runAnalysis() {
    if (targets.length === 0 || selectedCourses.size === 0) return;
    setShowResults(true);
  }

  const canAnalyze = targets.length > 0 && selectedCourses.size > 0;
  const currentStep = targets.length === 0 ? 1 : !showResults ? 2 : 3;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* 헤더 */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 14L3 7M7 14V4M11 14V9M15 14V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>입시연구소</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1" aria-label="메인 네비게이션">
              <Link href="/guide" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>교과 가이드</Link>
              <Link href="/search" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>과목 검색</Link>
              <Link href="/my-strategy" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: "var(--brand-blue)", fontWeight: 700 }}>맞춤 전략</Link>
              <Link href="/policy" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>2028 정책</Link>
              <Link href="/contract" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link" style={{ color: "var(--text-secondary)" }}>계약학과</Link>
            </nav>
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
              style={{ background: "rgba(168, 85, 247, 0.08)", color: "#7c3aed", border: "1px solid rgba(168, 85, 247, 0.16)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
              교과 적합도 분석
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            맞춤 과목 전략
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            목표 대학과 현재 수강 과목을 입력하면, 적합도를 분석해드립니다
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { step: 1, label: "목표 설정" },
            { step: 2, label: "과목 선택" },
            { step: 3, label: "분석 결과" },
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
              <span className="text-xs font-medium hidden sm:inline" style={{ color: currentStep >= step ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                {label}
              </span>
              {step < 3 && (
                <div className="w-8 h-px mx-1" style={{ background: currentStep > step ? "var(--brand-blue)" : "var(--border-medium)" }} />
              )}
            </div>
          ))}
        </div>

        {/* ═══ STEP 1: 목표 대학/학과 선택 ═══ */}
        <section className="rounded-2xl p-6 md:p-8 mb-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2" style={{ background: "var(--brand-blue)" }}>1</span>
            목표 대학 · 학과 선택
          </h2>
          <p className="text-xs mb-5 ml-8" style={{ color: "var(--text-tertiary)" }}>
            {isLoggedIn ? "최대 3개까지 비교할 수 있습니다" : "비로그인 시 1개 대학만 분석 가능합니다"}
          </p>

          {/* 선택된 목표 목록 */}
          {targets.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 ml-8">
              {targets.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
                  style={{ background: "rgba(26, 86, 219, 0.08)", color: "var(--brand-blue)", border: "1px solid rgba(26, 86, 219, 0.16)" }}>
                  {t.university} · {t.department}
                  <button onClick={() => removeTarget(i)} className="ml-1 hover:opacity-70" aria-label="삭제">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 로그인 유도 배너 */}
          {!isLoggedIn && targets.length >= 1 && (
            <div className="ml-8 mb-4 rounded-xl p-4 flex items-center justify-between gap-4"
              style={{ background: "rgba(26, 86, 219, 0.06)", border: "1px solid rgba(26, 86, 219, 0.15)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--brand-blue)" }}>
                  로그인하면 3개 대학까지 비교할 수 있어요
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  분석 결과 저장 · 즐겨찾기 기능도 제공됩니다
                </p>
              </div>
              <button
                onClick={() => signIn()}
                className="shrink-0 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5"
                style={{ background: "var(--brand-blue)" }}
              >
                로그인
              </button>
            </div>
          )}

          {/* 추가 폼 */}
          {targets.length < maxTargets && (
            <div className="flex flex-col sm:flex-row gap-3 ml-8">
              <select
                value={currentUni}
                onChange={(e) => { setCurrentUni(e.target.value); setCurrentDept(""); }}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                style={{ background: "var(--surface-2)", borderColor: "var(--border-medium)", color: "var(--text-primary)" }}
              >
                <option value="">대학 선택</option>
                {sortedUniversities.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>

              <select
                value={currentDept}
                onChange={(e) => setCurrentDept(e.target.value)}
                disabled={!currentUni}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                style={{ background: "var(--surface-2)", borderColor: "var(--border-medium)", color: "var(--text-primary)" }}
              >
                <option value="">학과 선택</option>
                {currentUni && sortedDepartmentMap[currentUni]?.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
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
        </section>

        {/* ═══ STEP 2: 현재 수강 과목 선택 ═══ */}
        <section className="rounded-2xl p-6 md:p-8 mb-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2" style={{ background: targets.length > 0 ? "var(--brand-blue)" : "var(--surface-2)", color: targets.length > 0 ? "white" : "var(--text-tertiary)" }}>2</span>
            현재 수강 · 예정 과목
          </h2>
          <p className="text-xs mb-5 ml-8" style={{ color: "var(--text-tertiary)" }}>
            이수했거나 수강 예정인 과목을 모두 선택하세요
            {selectedCourses.size > 0 && (
              <span className="ml-2 font-semibold" style={{ color: "var(--brand-blue)" }}>{selectedCourses.size}개 선택됨</span>
            )}
          </p>

          <div className="space-y-2 ml-8">
            {CATEGORY_ORDER.filter((cat) => subjectGroups[cat]).map((cat) => {
              const isOpen = openCategories.has(cat);
              const selectedInCat = subjectGroups[cat].filter((s) => selectedCourses.has(normalizeSubject(s))).length;
              return (
                <div key={cat} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-medium)" }}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:opacity-80"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{cat}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                        {subjectGroups[cat].length}개
                      </span>
                      {selectedInCat > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(26, 86, 219, 0.1)", color: "var(--brand-blue)" }}>
                          {selectedInCat}개 선택
                        </span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3 flex flex-wrap gap-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      {subjectGroups[cat].map((subject) => {
                        const selected = selectedCourses.has(normalizeSubject(subject));
                        return (
                          <button
                            key={subject}
                            onClick={() => toggleCourse(subject)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              selected ? CATEGORY_SELECTED[cat] : CATEGORY_COLORS[cat]
                            }`}
                          >
                            {subject}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 분석 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={runAnalysis}
            disabled={!canAnalyze}
            className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: canAnalyze ? "var(--brand-blue)" : "var(--surface-2)", boxShadow: canAnalyze ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            적합도 분석하기
          </button>
          {!canAnalyze && (
            <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
              {targets.length === 0 ? "목표 대학/학과를 먼저 선택하세요" : "수강 과목을 선택하세요"}
            </p>
          )}
        </div>

        {/* ═══ STEP 3: 분석 결과 ═══ */}
        {showResults && results.length > 0 && (
          <section className="space-y-6" aria-label="분석 결과">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>분석 결과</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                선택한 {selectedCourses.size}개 과목 기준 적합도
              </p>
            </div>

            {results.map((result, idx) => {
              const grade = getScoreGrade(result.coverageScore);
              const config = GRADE_CONFIG[grade];

              return (
                <div key={idx} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--surface-1)", boxShadow: "var(--shadow-card)" }}>
                  {/* 헤더: 대학 + 점수 */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{result.university}</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{result.department}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* 점수 원형 */}
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
                          <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4"
                            strokeDasharray={`${(result.coverageScore / 100) * 175.9} 175.9`}
                            strokeLinecap="round"
                            className={grade === "excellent" ? "stroke-emerald-500" : grade === "good" ? "stroke-blue-500" : grade === "warning" ? "stroke-amber-500" : "stroke-red-500"}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {result.coverageScore}
                        </span>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.bgColor} ${config.color} ${config.borderColor}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* 미이수 핵심권장 (경고) */}
                    {result.missingCore.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm font-semibold text-red-600">미이수 핵심권장과목</span>
                          <span className="text-xs text-red-400">미이수 시 불이익 가능</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingCore.map((s) => (
                            <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 이수한 핵심권장 */}
                    {result.matchedCore.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-semibold text-emerald-600">이수 완료 핵심권장과목</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedCore.map((s) => (
                            <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 미이수 권장 */}
                    {result.missingRec.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-amber-600">미이수 권장과목</span>
                          <span className="text-xs text-amber-400">이수 권장</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingRec.map((s) => (
                            <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 이수한 권장 */}
                    {result.matchedRec.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-semibold text-blue-600">이수 완료 권장과목</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedRec.map((s) => (
                            <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 핵심/권장 모두 0인 경우 */}
                    {result.matchedCore.length === 0 && result.missingCore.length === 0 && result.matchedRec.length === 0 && result.missingRec.length === 0 && (
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        해당 학과의 권장과목 데이터가 없습니다.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 면책 조항 */}
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}>
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
