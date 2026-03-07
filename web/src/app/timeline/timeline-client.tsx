"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { CourseRecommendationData } from "@/lib/types";
import { planTimeline, type TimelineResult, type TimelineSlot } from "@/lib/timeline-planner";
import { LEVEL_COLORS, type CourseLevel } from "@/lib/subject";
import { Footer } from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import DesktopNav from "@/components/desktop-nav";
import AuthButton from "@/components/auth-button";

// ── Props ──
interface Props {
  courseData: CourseRecommendationData;
  universities: string[];
  departmentMap: Record<string, string[]>;
}

// ── 우선순위 스타일 ──
const PRIORITY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  "필수": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "권장": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "추천": { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
};

// ── 카테고리 색상 ──
const CAT_DOT: Record<string, string> = {
  수학: "bg-violet-500",
  과학: "bg-emerald-500",
  사회: "bg-amber-500",
  언어: "bg-rose-500",
  정보: "bg-cyan-500",
  기타: "bg-slate-400",
};

// ── 슬롯 카드 ──
function SlotCard({ slot }: { slot: TimelineSlot }) {
  const pStyle = PRIORITY_STYLE[slot.priority] ?? PRIORITY_STYLE["추천"];
  const levelColor = LEVEL_COLORS[slot.level as CourseLevel] ?? LEVEL_COLORS["일반선택"];

  return (
    <div
      className="rounded-xl p-3 border"
      style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${CAT_DOT[slot.category] ?? CAT_DOT["기타"]}`} />
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {slot.subject}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
          {slot.priority}
        </span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${levelColor}`}>
          {slot.level}
        </span>
      </div>
      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{slot.reason}</p>
    </div>
  );
}

export default function TimelineClient({ courseData, universities, departmentMap }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  // ── 상태 ──
  const [targets, setTargets] = useState<{ university: string; department: string }[]>([]);
  const [currentUni, setCurrentUni] = useState("");
  const [currentDept, setCurrentDept] = useState("");
  const [showResults, setShowResults] = useState(false);

  // ── 정렬 ──
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

  // ── 타임라인 결과 ──
  const timelineResult: TimelineResult | null = useMemo(() => {
    if (!showResults || targets.length === 0) return null;
    return planTimeline(courseData, targets);
  }, [showResults, targets, courseData]);

  // ── 핸들러 ──
  function addTarget() {
    if (!currentUni || !currentDept) return;
    if (targets.length >= 5) return;
    if (targets.some((t) => t.university === currentUni && t.department === currentDept)) return;
    setTargets([...targets, { university: currentUni, department: currentDept }]);
    setCurrentDept("");
    setShowResults(false);
  }

  function removeTarget(idx: number) {
    setTargets(targets.filter((_, i) => i !== idx));
    setShowResults(false);
  }

  const canAnalyze = targets.length >= 2;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* 헤더 */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                <svg width="18" height="18" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                  <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                  <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                  <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>입시연구소</span>
            </Link>
            <DesktopNav activePath="/timeline" />
            <div className="flex items-center gap-2">
              <AuthButton />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
              style={{ background: "rgba(16, 185, 129, 0.08)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.16)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
              학년별 과목 배치
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            이수 타임라인
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            목표 대학 기준으로 고1→고2→고3 최적 과목 배치를 제안합니다
          </p>
        </div>

        {/* 목표 대학/학과 선택 */}
        <section
          className="rounded-2xl p-6 md:p-8 mb-6"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2" style={{ background: "var(--brand-blue)" }}>1</span>
            목표 대학 · 학과 선택
          </h2>
          <p className="text-xs mb-5 ml-8" style={{ color: "var(--text-tertiary)" }}>
            2~5개 대학/학과를 선택하세요
            {targets.length > 0 && (
              <span className="ml-2 font-semibold" style={{ color: "var(--brand-blue)" }}>{targets.length}개 선택됨</span>
            )}
          </p>

          {targets.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 ml-8">
              {targets.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
                  style={{ background: "rgba(26, 86, 219, 0.08)", color: "var(--brand-blue)", border: "1px solid rgba(26, 86, 219, 0.16)" }}
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

          {targets.length < 5 && (
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

        {/* 생성 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowResults(true)}
            disabled={!canAnalyze}
            className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            style={{
              background: canAnalyze ? "var(--brand-blue)" : "var(--surface-2)",
              boxShadow: canAnalyze ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            타임라인 생성
          </button>
          {!canAnalyze && (
            <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
              목표 대학/학과를 2개 이상 선택하세요
            </p>
          )}
        </div>

        {/* ═══ 타임라인 결과 ═══ */}
        {showResults && timelineResult && (
          <section className="space-y-6" aria-label="학년별 타임라인">
            {/* 가로 3칸 타임라인 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { grade: 1 as const, label: "고등학교 1학년", slots: timelineResult.grade1, color: "border-emerald-300", headerBg: "bg-emerald-50", headerText: "text-emerald-700" },
                { grade: 2 as const, label: "고등학교 2학년", slots: timelineResult.grade2, color: "border-blue-300", headerBg: "bg-blue-50", headerText: "text-blue-700" },
                { grade: 3 as const, label: "고등학교 3학년", slots: timelineResult.grade3, color: "border-purple-300", headerBg: "bg-purple-50", headerText: "text-purple-700" },
              ].map(({ grade, label, slots, color, headerBg, headerText }) => {
                // 로그인 게이트: 비로그인은 고1만
                const isLocked = !isLoggedIn && grade > 1;

                return (
                  <div
                    key={grade}
                    className={`rounded-2xl border-2 ${color} overflow-hidden`}
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    {/* 헤더 */}
                    <div className={`px-5 py-3 ${headerBg}`}>
                      <h3 className={`text-base font-bold ${headerText}`}>{label}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {slots.length}개 과목
                      </p>
                    </div>

                    {/* 과목 카드 */}
                    <div className="p-4 space-y-3" style={{ background: "var(--surface-1)" }}>
                      {isLocked ? (
                        <div className="text-center py-8">
                          <svg className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                            로그인하면 볼 수 있어요
                          </p>
                          <button
                            onClick={() => signIn()}
                            className="px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5"
                            style={{ background: "var(--brand-blue)" }}
                          >
                            무료 로그인
                          </button>
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-center py-4" style={{ color: "var(--text-tertiary)" }}>
                          해당 학년에 배치할 과목이 없습니다
                        </p>
                      ) : (
                        slots.map((slot, i) => <SlotCard key={i} slot={slot} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 범례 */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>범례</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>우선순위</p>
                  <div className="space-y-1">
                    {(["필수", "권장", "추천"] as const).map((p) => (
                      <div key={p} className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${PRIORITY_STYLE[p].bg} ${PRIORITY_STYLE[p].text} ${PRIORITY_STYLE[p].border}`}>{p}</span>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {p === "필수" ? "50%+ 학과의 핵심" : p === "권장" ? "일부 학과의 핵심" : "학과에서 권장"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>과목 레벨</p>
                  <div className="space-y-1">
                    {(["공통", "일반선택", "진로선택", "융합선택"] as CourseLevel[]).map((l) => (
                      <div key={l} className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${LEVEL_COLORS[l]}`}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>카테고리</p>
                  <div className="space-y-1">
                    {Object.entries(CAT_DOT).map(([cat, color]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 면책 조항 */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                본 타임라인은 교육과정 구조와 선수과목 관계를 기반으로 한 참고용 제안입니다.
                <br />
                실제 이수 순서는 학교별 교육과정 편성에 따라 다를 수 있으므로, 담임교사와 상의하시기 바랍니다.
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
