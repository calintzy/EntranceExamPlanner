"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { CourseRecommendationData } from "@/lib/types";
import { analyzeGap, getScoreGrade, GRADE_CONFIG, type GapAnalysisResult } from "@/lib/gap-analysis";
import { normalizeSubject, categorizeSubject } from "@/lib/subject";
import { analyzeRoadmap, type RoadmapSummary, type RoadmapResult } from "@/lib/roadmap-analyzer";
import { generateNarrative, type NarrativeResult } from "@/lib/narrative-generator";
import { simulateSwap, type SwapResult } from "@/lib/swap-simulator";
import { Footer } from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import DesktopNav from "@/components/desktop-nav";
import AuthButton from "@/components/auth-button";
import SubjectSelector from "@/components/subject-selector";

// ── Props ──
interface Props {
  courseData: CourseRecommendationData;
  universities: string[];
  departmentMap: Record<string, string[]>;
  allSubjects: string[];
}

// ── 탭 타입 ──
type ActiveTab = "gap" | "roadmap" | "story" | "swap";

// ── 로드맵 등급별 스타일 설정 ──
const TIER_CONFIG = {
  excellent: {
    label: "안정권",
    emoji: "🟢",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  good: {
    label: "도전권",
    emoji: "🔵",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  warning: {
    label: "보완 필요",
    emoji: "🟡",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  danger: {
    label: "미흡",
    emoji: "🔴",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
} as const;

// ── 점수 원형 SVG (로드맵 카드용) ──
function ScoreCircle({ score, grade }: { score: number; grade: string }) {
  const strokeClass =
    grade === "excellent"
      ? "stroke-emerald-500"
      : grade === "good"
      ? "stroke-blue-500"
      : grade === "warning"
      ? "stroke-amber-500"
      : "stroke-red-500";

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          strokeWidth="4"
          strokeDasharray={`${(score / 100) * 175.9} 175.9`}
          strokeLinecap="round"
          className={strokeClass}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {score}
      </span>
    </div>
  );
}

export default function StrategyClient({
  courseData,
  universities,
  departmentMap,
  allSubjects,
}: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  // ── 탭 상태 ──
  const [activeTab, setActiveTab] = useState<ActiveTab>("gap");

  // ── 공유 과목 상태 (모든 탭에서 동일 Set 사용) ──
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  // ── 갭 분석 탭 상태 ──
  const maxTargets = isLoggedIn ? 3 : 1;
  const [targets, setTargets] = useState<{ university: string; department: string }[]>([]);
  const [currentUni, setCurrentUni] = useState("");
  const [currentDept, setCurrentDept] = useState("");
  const [showResults, setShowResults] = useState(false);

  // ── 로드맵 탭 상태 ──
  const [roadmapResults, setRoadmapResults] = useState<RoadmapSummary | null>(null);

  // ── 진로 스토리 탭 상태 ──
  const [narrativeTarget, setNarrativeTarget] = useState<{ university: string; department: string } | null>(null);
  const [narrativeUni, setNarrativeUni] = useState("");
  const [narrativeDept, setNarrativeDept] = useState("");
  const [narrativeResult, setNarrativeResult] = useState<NarrativeResult | null>(null);
  const [copied, setCopied] = useState(false);

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

  // ── 과목 토글 (정규화 후 공유 Set 업데이트) ──
  function toggleCourse(subject: string) {
    const next = new Set(selectedCourses);
    const normalized = normalizeSubject(subject);
    if (next.has(normalized)) next.delete(normalized);
    else next.add(normalized);
    setSelectedCourses(next);
    // 결과 초기화
    setShowResults(false);
    setRoadmapResults(null);
    setNarrativeResult(null);
  }

  // ── 갭 분석 핸들러 ──
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

  function runGapAnalysis() {
    if (targets.length === 0 || selectedCourses.size === 0) return;
    setShowResults(true);
  }

  // ── 갭 분석 결과 계산 ──
  const gapResults: GapAnalysisResult[] = useMemo(() => {
    if (!showResults || targets.length === 0 || selectedCourses.size === 0) return [];
    return analyzeGap(courseData, {
      targetUniversities: targets,
      currentCourses: Array.from(selectedCourses),
    });
  }, [showResults, targets, selectedCourses, courseData]);

  const canGapAnalyze = targets.length > 0 && selectedCourses.size > 0;
  const gapStep = targets.length === 0 ? 1 : !showResults ? 2 : 3;

  // ── 로드맵 스캔 핸들러 ──
  function runRoadmapScan() {
    if (selectedCourses.size === 0) return;
    const result = analyzeRoadmap(courseData, Array.from(selectedCourses));
    setRoadmapResults(result);
  }

  // ── 스토리 생성 핸들러 ──
  function runNarrativeGeneration() {
    if (!narrativeTarget || selectedCourses.size === 0) return;
    const result = generateNarrative(courseData, {
      university: narrativeTarget.university,
      department: narrativeTarget.department,
      currentCourses: Array.from(selectedCourses),
    });
    setNarrativeResult(result);
  }

  function setNarrativeTargetFromForm() {
    if (!narrativeUni || !narrativeDept) return;
    setNarrativeTarget({ university: narrativeUni, department: narrativeDept });
    setNarrativeResult(null);
  }

  // ── 스토리 클립보드 복사 ──
  async function copyNarrativeToClipboard() {
    if (!narrativeResult) return;
    const text = [
      `[요약] ${narrativeResult.summary}`,
      "",
      "[강점 분석]",
      ...narrativeResult.strengthPoints.map((p) => `• ${p}`),
      "",
      "[성장 포인트]",
      ...narrativeResult.growthPoints.map((p) => `• ${p}`),
      "",
      "[전공 연결 스토리]",
      narrativeResult.connectionStory,
      "",
      "[면접 활용 팁]",
      narrativeResult.interviewTip,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── 교체 시뮬레이터 탭 상태 ──
  const [swapDrop, setSwapDrop] = useState("");
  const [swapAdd, setSwapAdd] = useState("");
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [swapCount, setSwapCount] = useState(0);
  const maxSwaps = isLoggedIn ? Infinity : 1;

  // 선택된 과목 배열 (드롭다운용)
  const selectedCoursesArray = useMemo(() => Array.from(selectedCourses), [selectedCourses]);

  // 선택되지 않은 과목 (넣을 과목 후보)
  const availableToAdd = useMemo(() => {
    return allSubjects.filter((s) => !selectedCourses.has(normalizeSubject(s)));
  }, [allSubjects, selectedCourses]);

  function runSwapSimulation() {
    if (!swapDrop || !swapAdd || selectedCourses.size === 0) return;
    if (swapCount >= maxSwaps) return;
    const result = simulateSwap(courseData, Array.from(selectedCourses), swapDrop, swapAdd);
    setSwapResult(result);
    setSwapCount((c) => c + 1);
  }

  // ── 탭 바 ──
  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "gap", label: "갭 분석" },
    { key: "roadmap", label: "대학 로드맵" },
    { key: "story", label: "진로 스토리" },
    { key: "swap", label: "교체 시뮬레이터" },
  ];

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
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                입시연구소
              </span>
            </Link>
            <DesktopNav activePath="/my-strategy" />
            <div className="flex items-center gap-2">
              <AuthButton />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
              style={{
                background: "rgba(168, 85, 247, 0.08)",
                color: "#7c3aed",
                border: "1px solid rgba(168, 85, 247, 0.16)",
              }}
            >
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

        {/* ── 탭 바 ── */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex gap-1 p-1 rounded-2xl"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
            role="tablist"
            aria-label="전략 분석 탭"
          >
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={
                  activeTab === key
                    ? {
                        background: "var(--brand-blue)",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                      }
                    : {
                        background: "transparent",
                        color: "var(--text-secondary)",
                      }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            TAB 1: 갭 분석
        ════════════════════════════════════════ */}
        {activeTab === "gap" && (
          <>
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
                      background: gapStep >= step ? "var(--brand-blue)" : "var(--surface-2)",
                      color: gapStep >= step ? "white" : "var(--text-tertiary)",
                    }}
                  >
                    {step}
                  </div>
                  <span
                    className="text-xs font-medium hidden sm:inline"
                    style={{ color: gapStep >= step ? "var(--text-primary)" : "var(--text-tertiary)" }}
                  >
                    {label}
                  </span>
                  {step < 3 && (
                    <div
                      className="w-8 h-px mx-1"
                      style={{ background: gapStep > step ? "var(--brand-blue)" : "var(--border-medium)" }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* STEP 1: 목표 대학/학과 선택 */}
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
                {isLoggedIn ? "최대 3개까지 비교할 수 있습니다" : "비로그인 시 1개 대학만 분석 가능합니다"}
              </p>

              {/* 선택된 목표 목록 */}
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
                      <button onClick={() => removeTarget(i)} className="ml-1 hover:opacity-70" aria-label="삭제">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 로그인 유도 배너 */}
              {!isLoggedIn && targets.length >= 1 && (
                <div
                  className="ml-8 mb-4 rounded-xl p-4 flex items-center justify-between gap-4"
                  style={{
                    background: "rgba(26, 86, 219, 0.06)",
                    border: "1px solid rgba(26, 86, 219, 0.15)",
                  }}
                >
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
            </section>

            {/* STEP 2: 과목 선택 (SubjectSelector 컴포넌트) */}
            <SubjectSelector
              allSubjects={allSubjects}
              selectedCourses={selectedCourses}
              onToggle={toggleCourse}
              showStepNumber={2}
              isActive={targets.length > 0}
            />

            {/* 분석 버튼 */}
            <div className="text-center mb-8">
              <button
                onClick={runGapAnalysis}
                disabled={!canGapAnalyze}
                className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                style={{
                  background: canGapAnalyze ? "var(--brand-blue)" : "var(--surface-2)",
                  boxShadow: canGapAnalyze ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none",
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                적합도 분석하기
              </button>
              {!canGapAnalyze && (
                <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                  {targets.length === 0 ? "목표 대학/학과를 먼저 선택하세요" : "수강 과목을 선택하세요"}
                </p>
              )}
            </div>

            {/* STEP 3: 갭 분석 결과 */}
            {showResults && gapResults.length > 0 && (
              <section className="space-y-6" aria-label="분석 결과">
                <div className="text-center mb-8">
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    분석 결과
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                    선택한 {selectedCourses.size}개 과목 기준 적합도
                  </p>
                </div>

                {gapResults.map((result, idx) => {
                  const grade = getScoreGrade(result.coverageScore);
                  const config = GRADE_CONFIG[grade];

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden"
                      style={{
                        border: "1px solid var(--border-subtle)",
                        background: "var(--surface-1)",
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      {/* 헤더: 대학 + 점수 */}
                      <div
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      >
                        <div>
                          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                            {result.university}
                          </h3>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {result.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* 점수 원형 */}
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="var(--border-subtle)"
                                strokeWidth="4"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                strokeWidth="4"
                                strokeDasharray={`${(result.coverageScore / 100) * 175.9} 175.9`}
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
                            <span
                              className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {result.coverageScore}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.bgColor} ${config.color} ${config.borderColor}`}
                          >
                            {config.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* 미이수 핵심권장 (경고) */}
                        {result.missingCore.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2.5">
                              <svg
                                className="w-4 h-4 text-red-500 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                              <span className="text-sm font-semibold text-red-600">미이수 핵심권장과목</span>
                              <span className="text-xs text-red-400">미이수 시 불이익 가능</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {result.missingCore.map((s) => (
                                <span
                                  key={s}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 이수한 핵심권장 */}
                        {result.matchedCore.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2.5">
                              <svg
                                className="w-4 h-4 text-emerald-500 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm font-semibold text-emerald-600">이수 완료 핵심권장과목</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {result.matchedCore.map((s) => (
                                <span
                                  key={s}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 미이수 권장 */}
                        {result.missingRec.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2.5">
                              <svg
                                className="w-4 h-4 text-amber-500 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm font-semibold text-amber-600">미이수 권장과목</span>
                              <span className="text-xs text-amber-400">이수 권장</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {result.missingRec.map((s) => (
                                <span
                                  key={s}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 이수한 권장 */}
                        {result.matchedRec.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2.5">
                              <svg
                                className="w-4 h-4 text-blue-500 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm font-semibold text-blue-600">이수 완료 권장과목</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {result.matchedRec.map((s) => (
                                <span
                                  key={s}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 데이터 없는 경우 */}
                        {result.matchedCore.length === 0 &&
                          result.missingCore.length === 0 &&
                          result.matchedRec.length === 0 &&
                          result.missingRec.length === 0 && (
                            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                              해당 학과의 권장과목 데이터가 없습니다.
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })}

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
          </>
        )}

        {/* ════════════════════════════════════════
            TAB 2: 대학 로드맵
        ════════════════════════════════════════ */}
        {activeTab === "roadmap" && (
          <>
            {/* STEP 1: 과목 선택 */}
            <SubjectSelector
              allSubjects={allSubjects}
              selectedCourses={selectedCourses}
              onToggle={toggleCourse}
              showStepNumber={1}
              isActive={true}
              label="수강 · 예정 과목 선택"
              description="이수했거나 수강 예정인 과목을 모두 선택하세요"
            />

            {/* STEP 2: 전체 대학 스캔 버튼 */}
            <div className="text-center mb-8">
              <button
                onClick={runRoadmapScan}
                disabled={selectedCourses.size === 0}
                className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                style={{
                  background: selectedCourses.size > 0 ? "var(--brand-blue)" : "var(--surface-2)",
                  boxShadow: selectedCourses.size > 0 ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none",
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                전체 대학 스캔
              </button>
              {selectedCourses.size === 0 && (
                <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                  수강 과목을 먼저 선택하세요
                </p>
              )}
            </div>

            {/* STEP 3: 로드맵 결과 — 4개 티어로 분류 */}
            {roadmapResults && (
              <section className="space-y-8" aria-label="대학 로드맵 결과">
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    대학 로드맵
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                    총 {roadmapResults.totalScanned}개 학과 분석 완료
                  </p>
                </div>

                {(["excellent", "good", "warning", "danger"] as const).map((tier) => {
                  const tierData = roadmapResults[tier];
                  const cfg = TIER_CONFIG[tier];
                  // 비로그인 시 티어당 최대 5개만 표시
                  const displayData = isLoggedIn ? tierData : tierData.slice(0, 5);
                  const hiddenCount = isLoggedIn ? 0 : tierData.length - displayData.length;

                  if (tierData.length === 0) return null;

                  return (
                    <div key={tier}>
                      {/* 티어 헤더 */}
                      <div className={`flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl border ${cfg.bgColor} ${cfg.borderColor}`}>
                        <span className="text-base">{cfg.emoji}</span>
                        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                        <span className={`text-xs font-medium ml-auto ${cfg.color} opacity-70`}>
                          {tierData.length}개 학과
                        </span>
                      </div>

                      {/* 결과 카드 목록 */}
                      <div className="space-y-3">
                        {displayData.map((result: RoadmapResult, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 rounded-xl p-4"
                            style={{
                              background: "var(--surface-1)",
                              border: "1px solid var(--border-subtle)",
                              boxShadow: "var(--shadow-card)",
                            }}
                          >
                            {/* 점수 원형 */}
                            <ScoreCircle score={result.coverageScore} grade={result.grade} />

                            {/* 대학/학과 정보 */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                                {result.university}
                              </p>
                              <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                                {result.department}
                              </p>
                              {/* 미이수 핵심과목 태그 */}
                              {result.missingCore.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {result.missingCore.map((s) => (
                                    <span
                                      key={s}
                                      className="px-2 py-0.5 text-xs font-medium rounded bg-red-50 text-red-600 border border-red-200"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 비로그인 제한 배너 */}
                      {hiddenCount > 0 && (
                        <div
                          className="mt-3 rounded-xl p-4 flex items-center justify-between gap-4"
                          style={{
                            background: "rgba(26, 86, 219, 0.06)",
                            border: "1px solid rgba(26, 86, 219, 0.15)",
                          }}
                        >
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            <span className="font-semibold" style={{ color: "var(--brand-blue)" }}>
                              +{hiddenCount}개
                            </span>{" "}
                            결과가 더 있습니다. 로그인하면 전체 확인 가능합니다.
                          </p>
                          <button
                            onClick={() => signIn()}
                            className="shrink-0 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5"
                            style={{ background: "var(--brand-blue)" }}
                          >
                            로그인
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 면책 조항 */}
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
                >
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    본 분석은 대교협 adiga.kr 및 각 대학 입학처 공식 자료를 기반으로 한 참고용 정보입니다.
                    <br />
                    정확한 입시 정보는 반드시 각 대학 입학처를 통해 확인하시기 바랍니다.
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            TAB 3: 진로 스토리
        ════════════════════════════════════════ */}
        {activeTab === "story" && (
          <>
            {/* STEP 1: 목표 대학/학과 선택 (단일) */}
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
                스토리를 생성할 대학과 학과를 하나 선택하세요
              </p>

              {/* 선택된 목표 표시 */}
              {narrativeTarget && (
                <div className="flex flex-wrap gap-2 mb-4 ml-8">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
                    style={{
                      background: "rgba(26, 86, 219, 0.08)",
                      color: "var(--brand-blue)",
                      border: "1px solid rgba(26, 86, 219, 0.16)",
                    }}
                  >
                    {narrativeTarget.university} · {narrativeTarget.department}
                    <button
                      onClick={() => {
                        setNarrativeTarget(null);
                        setNarrativeResult(null);
                      }}
                      className="ml-1 hover:opacity-70"
                      aria-label="삭제"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              )}

              {/* 선택 폼 */}
              {!narrativeTarget && (
                <div className="flex flex-col sm:flex-row gap-3 ml-8">
                  <select
                    value={narrativeUni}
                    onChange={(e) => {
                      setNarrativeUni(e.target.value);
                      setNarrativeDept("");
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
                    value={narrativeDept}
                    onChange={(e) => setNarrativeDept(e.target.value)}
                    disabled={!narrativeUni}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border-medium)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">학과 선택</option>
                    {narrativeUni &&
                      sortedDepartmentMap[narrativeUni]?.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={setNarrativeTargetFromForm}
                    disabled={!narrativeUni || !narrativeDept}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                    style={{ background: "var(--brand-blue)" }}
                  >
                    선택
                  </button>
                </div>
              )}
            </section>

            {/* STEP 2: 과목 선택 */}
            <SubjectSelector
              allSubjects={allSubjects}
              selectedCourses={selectedCourses}
              onToggle={toggleCourse}
              showStepNumber={2}
              isActive={!!narrativeTarget}
              label="수강 · 예정 과목 선택"
              description="이수했거나 수강 예정인 과목을 모두 선택하세요"
            />

            {/* STEP 3: 스토리 생성 버튼 */}
            <div className="text-center mb-8">
              <button
                onClick={runNarrativeGeneration}
                disabled={!narrativeTarget || selectedCourses.size === 0}
                className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                style={{
                  background: narrativeTarget && selectedCourses.size > 0 ? "var(--brand-blue)" : "var(--surface-2)",
                  boxShadow:
                    narrativeTarget && selectedCourses.size > 0 ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none",
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                스토리 생성
              </button>
              {(!narrativeTarget || selectedCourses.size === 0) && (
                <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                  {!narrativeTarget ? "목표 대학/학과를 먼저 선택하세요" : "수강 과목을 선택하세요"}
                </p>
              )}
            </div>

            {/* STEP 4: 진로 스토리 결과 */}
            {narrativeResult && (
              <section className="space-y-5" aria-label="진로 스토리 결과">
                {/* 요약 카드 */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(26, 86, 219, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)",
                    border: "1px solid rgba(26, 86, 219, 0.15)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
                      {narrativeResult.summary}
                    </p>
                    {/* 전체 복사 버튼 */}
                    <button
                      onClick={copyNarrativeToClipboard}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:opacity-80"
                      style={{
                        background: "var(--surface-1)",
                        border: "1px solid var(--border-medium)",
                        color: "var(--text-secondary)",
                      }}
                      title="전체 스토리 복사"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          복사됨
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          전체 복사
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    핵심권장과목 {narrativeResult.matchedCoreCount}/{narrativeResult.totalCoreCount}개 이수
                  </p>
                </div>

                {/* 로그인 게이트: 비로그인 시 상세 내용 블러 처리 */}
                {!isLoggedIn ? (
                  <div className="relative">
                    {/* 블러된 미리보기 */}
                    <div className="rounded-2xl p-6 space-y-5 pointer-events-none select-none"
                      style={{
                        background: "var(--surface-1)",
                        border: "1px solid var(--border-subtle)",
                        filter: "blur(4px)",
                        opacity: 0.5,
                      }}
                    >
                      <div>
                        <h3 className="text-sm font-bold mb-2 text-emerald-600">강점 분석</h3>
                        <ul className="space-y-1.5">
                          {(narrativeResult.strengthPoints.length > 0
                            ? narrativeResult.strengthPoints
                            : ["과목 이수를 통해 역량을 쌓았습니다."]
                          ).map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 로그인 오버레이 */}
                    <div
                      className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-6"
                      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(2px)" }}
                    >
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        로그인하면 상세 스토리를 확인할 수 있어요
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        강점 분석 · 성장 포인트 · 전공 연결 스토리 · 면접 팁
                      </p>
                      <button
                        onClick={() => signIn()}
                        className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5"
                        style={{ background: "var(--brand-blue)", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                      >
                        로그인하고 전체 보기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-6 space-y-6"
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {/* 강점 분석 */}
                    {narrativeResult.strengthPoints.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-emerald-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          강점 분석
                        </h3>
                        <ul className="space-y-2">
                          {narrativeResult.strengthPoints.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 성장 포인트 */}
                    {narrativeResult.growthPoints.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          성장 포인트
                        </h3>
                        <ul className="space-y-2">
                          {narrativeResult.growthPoints.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 전공 연결 스토리 */}
                    <div>
                      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--brand-blue)" }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        전공 연결 스토리
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {narrativeResult.connectionStory}
                      </p>
                    </div>

                    {/* 면접 활용 팁 */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "rgba(168, 85, 247, 0.06)",
                        border: "1px solid rgba(168, 85, 247, 0.15)",
                      }}
                    >
                      <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: "#7c3aed" }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        면접 활용 팁
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#6d28d9" }}>
                        {narrativeResult.interviewTip}
                      </p>
                    </div>
                  </div>
                )}

                {/* 면책 조항 */}
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
                >
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    본 스토리는 AI 없이 규칙 기반으로 생성된 참고용 초안입니다.
                    <br />
                    학생부 기재 전 반드시 담임교사 또는 입학사정관의 검토를 받으시기 바랍니다.
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            TAB 4: 교체 시뮬레이터
        ════════════════════════════════════════ */}
        {activeTab === "swap" && (
          <>
            {/* 과목 선택 */}
            <SubjectSelector
              allSubjects={allSubjects}
              selectedCourses={selectedCourses}
              onToggle={toggleCourse}
              label="현재 수강 · 예정 과목"
              description="교체 시뮬레이션할 기본 과목 목록을 선택하세요"
              showStepNumber={1}
            />

            {/* 교체 설정 */}
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
                  style={{ background: selectedCourses.size > 0 ? "var(--brand-blue)" : "var(--surface-2)" }}
                >
                  2
                </span>
                과목 교체 설정
              </h2>
              <p className="text-xs mb-5 ml-8" style={{ color: "var(--text-tertiary)" }}>
                빼는 과목과 넣는 과목을 선택하세요
              </p>

              <div className="flex flex-col sm:flex-row gap-3 ml-8">
                {/* 빼는 과목 */}
                <div className="flex-1">
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    빼는 과목
                  </label>
                  <select
                    value={swapDrop}
                    onChange={(e) => { setSwapDrop(e.target.value); setSwapResult(null); }}
                    disabled={selectedCourses.size === 0}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border-medium)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">선택하세요</option>
                    {selectedCoursesArray.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 화살표 */}
                <div className="flex items-end justify-center pb-2">
                  <svg className="w-6 h-6 rotate-90 sm:rotate-0" style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* 넣는 과목 */}
                <div className="flex-1">
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    넣는 과목
                  </label>
                  <select
                    value={swapAdd}
                    onChange={(e) => { setSwapAdd(e.target.value); setSwapResult(null); }}
                    disabled={selectedCourses.size === 0}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border-medium)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">선택하세요</option>
                    {availableToAdd.map((s) => (
                      <option key={s} value={normalizeSubject(s)}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 시뮬레이션 버튼 */}
            <div className="text-center mb-8">
              {swapCount >= maxSwaps && !isLoggedIn ? (
                <button
                  onClick={() => signIn()}
                  className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{ background: "rgba(26, 86, 219, 0.08)", color: "var(--brand-blue)", border: "1px solid rgba(26, 86, 219, 0.16)" }}
                >
                  로그인하면 다양한 교체 시나리오를 비교할 수 있어요
                </button>
              ) : (
                <button
                  onClick={runSwapSimulation}
                  disabled={!swapDrop || !swapAdd || selectedCourses.size === 0}
                  className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                  style={{
                    background: swapDrop && swapAdd ? "var(--brand-blue)" : "var(--surface-2)",
                    boxShadow: swapDrop && swapAdd ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none",
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  교체 시뮬레이션
                </button>
              )}
            </div>

            {/* 시뮬레이션 결과 */}
            {swapResult && (
              <section className="space-y-6" aria-label="교체 시뮬레이션 결과">
                {/* 요약 카드 */}
                <div
                  className="rounded-2xl p-6 md:p-8"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <h3 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    교체 결과 요약
                  </h3>
                  <div className="text-center mb-4">
                    <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                      <span className="font-semibold text-red-600">{swapDrop}</span>
                      {" → "}
                      <span className="font-semibold text-emerald-600">{swapAdd}</span>
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <p className={`text-3xl font-bold ${swapResult.netChange > 0 ? "text-emerald-600" : swapResult.netChange < 0 ? "text-red-600" : ""}`} style={swapResult.netChange === 0 ? { color: "var(--text-primary)" } : undefined}>
                          {swapResult.netChange > 0 ? "+" : ""}{swapResult.netChange}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>등급 변동 (학과)</p>
                      </div>
                      <div className="w-px h-10" style={{ background: "var(--border-medium)" }} />
                      <div className="text-center">
                        <p className={`text-3xl font-bold ${swapResult.avgScoreDiff > 0 ? "text-emerald-600" : swapResult.avgScoreDiff < 0 ? "text-red-600" : ""}`} style={swapResult.avgScoreDiff === 0 ? { color: "var(--text-primary)" } : undefined}>
                          {swapResult.avgScoreDiff > 0 ? "+" : ""}{swapResult.avgScoreDiff}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>평균 점수 변화</p>
                      </div>
                    </div>
                  </div>

                  {/* 4개 지표 카드 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "등급 상승", count: swapResult.gained.length, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "등급 하락", count: swapResult.lost.length, color: "text-red-600", bg: "bg-red-50" },
                      { label: "점수 상승", count: swapResult.improved.length, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "점수 하락", count: swapResult.worsened.length, color: "text-amber-600", bg: "bg-amber-50" },
                    ].map(({ label, count, color, bg }) => (
                      <div key={label} className={`rounded-xl p-3 text-center ${bg}`}>
                        <p className={`text-2xl font-bold ${color}`}>{count}</p>
                        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 비로그인: 요약만 + 로그인 유도 */}
                {!isLoggedIn && (
                  <div
                    className="rounded-2xl p-6 text-center"
                    style={{ background: "rgba(26, 86, 219, 0.04)", border: "1px solid rgba(26, 86, 219, 0.12)" }}
                  >
                    <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                      등급 상승 <strong className="text-emerald-600">{swapResult.gained.length}개</strong>, 하락 <strong className="text-red-600">{swapResult.lost.length}개</strong> 학과가 있습니다
                    </p>
                    <button
                      onClick={() => signIn()}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                      style={{ background: "var(--brand-blue)", color: "white" }}
                    >
                      로그인하면 상세 학과 목록을 확인할 수 있어요
                    </button>
                  </div>
                )}

                {/* 로그인: 상세 학과 목록 */}
                {isLoggedIn && swapResult.gained.length > 0 && (
                  <div
                    className="rounded-2xl p-6 md:p-8"
                    style={{
                      background: "rgba(16, 185, 129, 0.04)",
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <h3 className="text-base font-bold text-emerald-700 mb-4">
                      등급 상승 학과 (+{swapResult.gained.length})
                    </h3>
                    <div className="space-y-2">
                      {swapResult.gained.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                          style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
                        >
                          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                            {d.university} <span style={{ color: "var(--text-secondary)" }}>· {d.department}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${GRADE_CONFIG[d.beforeGrade].bgColor} ${GRADE_CONFIG[d.beforeGrade].color} ${GRADE_CONFIG[d.beforeGrade].borderColor}`}>
                              {GRADE_CONFIG[d.beforeGrade].label}
                            </span>
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5" />
                            </svg>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${GRADE_CONFIG[d.afterGrade].bgColor} ${GRADE_CONFIG[d.afterGrade].color} ${GRADE_CONFIG[d.afterGrade].borderColor}`}>
                              {GRADE_CONFIG[d.afterGrade].label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isLoggedIn && swapResult.lost.length > 0 && (
                  <div
                    className="rounded-2xl p-6 md:p-8"
                    style={{
                      background: "rgba(239, 68, 68, 0.04)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <h3 className="text-base font-bold text-red-700 mb-4">
                      등급 하락 학과 (-{swapResult.lost.length})
                    </h3>
                    <div className="space-y-2">
                      {swapResult.lost.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                          style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
                        >
                          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                            {d.university} <span style={{ color: "var(--text-secondary)" }}>· {d.department}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${GRADE_CONFIG[d.beforeGrade].bgColor} ${GRADE_CONFIG[d.beforeGrade].color} ${GRADE_CONFIG[d.beforeGrade].borderColor}`}>
                              {GRADE_CONFIG[d.beforeGrade].label}
                            </span>
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5" />
                            </svg>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${GRADE_CONFIG[d.afterGrade].bgColor} ${GRADE_CONFIG[d.afterGrade].color} ${GRADE_CONFIG[d.afterGrade].borderColor}`}>
                              {GRADE_CONFIG[d.afterGrade].label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 결과 없음 */}
                {swapResult.gained.length === 0 && swapResult.lost.length === 0 && (
                  <div
                    className="rounded-2xl p-6 text-center"
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      등급 변동 없음
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      이 교체는 등급에 영향이 없습니다. 점수 상승 {swapResult.improved.length}개, 하락 {swapResult.worsened.length}개 학과가 있습니다.
                    </p>
                  </div>
                )}

                {/* 면책 조항 */}
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
                >
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    본 시뮬레이션은 대교협 adiga.kr 및 각 대학 입학처 공식 자료를 기반으로 한 참고용 정보입니다.
                    <br />
                    정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처를 통해 확인하시기 바랍니다.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
