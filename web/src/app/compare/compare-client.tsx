"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { CourseRecommendationData } from "@/lib/types";
import { compareProfiles, type CompareResult } from "@/lib/compare-profiles";
import { normalizeSubject, categorizeSubject } from "@/lib/subject";
import { GRADE_CONFIG } from "@/lib/gap-analysis";
import SubjectSelector from "@/components/subject-selector";
import { Footer } from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import DesktopNav from "@/components/desktop-nav";
import AuthButton from "@/components/auth-button";

// ── Props ──
interface Props {
  courseData: CourseRecommendationData;
  allSubjects: string[];
}

// ── 카테고리 뱃지 ──
const CATEGORY_BADGE: Record<string, string> = {
  수학: "bg-violet-100 text-violet-800",
  과학: "bg-emerald-100 text-emerald-800",
  사회: "bg-amber-100 text-amber-800",
  언어: "bg-rose-100 text-rose-800",
  정보: "bg-cyan-100 text-cyan-800",
  기타: "bg-slate-100 text-slate-800",
};

export default function CompareClient({ courseData, allSubjects }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const searchParams = useSearchParams();

  // ── 상태 ──
  const [myCourses, setMyCourses] = useState<Set<string>>(new Set());
  const [friendCourses, setFriendCourses] = useState<Set<string>>(new Set());
  const [friendMode, setFriendMode] = useState<"select" | "link">("select");
  const [friendLink, setFriendLink] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL 파라미터에서 친구 과목 로드
  useEffect(() => {
    const coursesParam = searchParams.get("courses");
    if (coursesParam) {
      const courses = coursesParam.split(",").map((s) => normalizeSubject(decodeURIComponent(s.trim())));
      setFriendCourses(new Set(courses.filter(Boolean)));
      setFriendMode("link");
    }
  }, [searchParams]);

  // ── 핸들러 ──
  const toggleMyCourse = useCallback(
    (subject: string) => {
      const next = new Set(myCourses);
      const normalized = normalizeSubject(subject);
      if (next.has(normalized)) next.delete(normalized);
      else next.add(normalized);
      setMyCourses(next);
      setShowResults(false);
    },
    [myCourses]
  );

  const toggleFriendCourse = useCallback(
    (subject: string) => {
      const next = new Set(friendCourses);
      const normalized = normalizeSubject(subject);
      if (next.has(normalized)) next.delete(normalized);
      else next.add(normalized);
      setFriendCourses(next);
      setShowResults(false);
    },
    [friendCourses]
  );

  function parseFriendLink() {
    try {
      const url = new URL(friendLink);
      const coursesParam = url.searchParams.get("courses");
      if (coursesParam) {
        const courses = coursesParam.split(",").map((s) => normalizeSubject(decodeURIComponent(s.trim())));
        setFriendCourses(new Set(courses.filter(Boolean)));
      }
    } catch {
      // URL이 아닌 경우 쉼표 구분으로 시도
      const courses = friendLink.split(",").map((s) => normalizeSubject(s.trim()));
      setFriendCourses(new Set(courses.filter(Boolean)));
    }
  }

  function generateShareUrl() {
    const courses = Array.from(myCourses).join(",");
    const url = `${window.location.origin}/compare?courses=${encodeURIComponent(courses)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── 비교 결과 ──
  const compareResult: CompareResult | null = useMemo(() => {
    if (!showResults || myCourses.size === 0 || friendCourses.size === 0) return null;
    return compareProfiles(courseData, Array.from(myCourses), Array.from(friendCourses));
  }, [showResults, myCourses, friendCourses, courseData]);

  const canCompare = myCourses.size > 0 && friendCourses.size > 0;

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
            <DesktopNav activePath="/compare" />
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
              style={{ background: "rgba(236, 72, 153, 0.08)", color: "#db2777", border: "1px solid rgba(236, 72, 153, 0.16)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
              과목 선택 비교
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            친구와 비교하기
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            과목 선택을 비교하여 각자 유리한 대학/학과를 찾아보세요
          </p>
        </div>

        {/* 2컬럼 과목 선택 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 왼쪽: 나 */}
          <div>
            <SubjectSelector
              allSubjects={allSubjects}
              selectedCourses={myCourses}
              onToggle={toggleMyCourse}
              label="나의 과목"
              description="이수했거나 수강 예정인 과목을 선택하세요"
            />
            {/* 공유 링크 생성 (로그인 필요) */}
            {myCourses.size > 0 && (
              isLoggedIn ? (
                <button
                  onClick={generateShareUrl}
                  className="w-full py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: copied ? "rgba(16, 185, 129, 0.1)" : "rgba(26, 86, 219, 0.08)",
                    color: copied ? "#059669" : "var(--brand-blue)",
                    border: `1px solid ${copied ? "rgba(16, 185, 129, 0.2)" : "rgba(26, 86, 219, 0.16)"}`,
                  }}
                >
                  {copied ? "링크가 복사되었습니다!" : "내 과목 공유 링크 복사"}
                </button>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="w-full py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: "rgba(26, 86, 219, 0.06)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  로그인하면 친구에게 공유할 비교 링크를 만들 수 있어요
                </button>
              )
            )}
          </div>

          {/* 오른쪽: 친구 */}
          <div>
            {/* 모드 전환 */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-4"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
            >
              <button
                onClick={() => setFriendMode("select")}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                style={friendMode === "select" ? { background: "var(--brand-blue)", color: "white" } : { color: "var(--text-secondary)" }}
              >
                직접 선택
              </button>
              <button
                onClick={() => setFriendMode("link")}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                style={friendMode === "link" ? { background: "var(--brand-blue)", color: "white" } : { color: "var(--text-secondary)" }}
              >
                링크 붙여넣기
              </button>
            </div>

            {friendMode === "select" ? (
              <SubjectSelector
                allSubjects={allSubjects}
                selectedCourses={friendCourses}
                onToggle={toggleFriendCourse}
                label="친구의 과목"
                description="친구가 이수한 과목을 선택하세요"
              />
            ) : (
              <section
                className="rounded-2xl p-6 md:p-8 mb-6"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>친구의 과목</h2>
                <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
                  친구가 공유한 링크를 붙여넣으세요
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={friendLink}
                    onChange={(e) => setFriendLink(e.target.value)}
                    placeholder="공유 링크 또는 과목명 (쉼표 구분)"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border-medium)", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={parseFriendLink}
                    disabled={!friendLink}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
                    style={{ background: "var(--brand-blue)" }}
                  >
                    적용
                  </button>
                </div>
                {friendCourses.size > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {Array.from(friendCourses).map((s) => (
                      <span
                        key={s}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg ${CATEGORY_BADGE[categorizeSubject(s)] ?? CATEGORY_BADGE["기타"]}`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {/* 비교 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowResults(true)}
            disabled={!canCompare}
            className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            style={{
              background: canCompare ? "var(--brand-blue)" : "var(--surface-2)",
              boxShadow: canCompare ? "0 8px 30px rgba(37, 99, 235, 0.3)" : "none",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            비교 분석
          </button>
          {!canCompare && (
            <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
              양쪽 모두 과목을 선택해야 비교할 수 있습니다
            </p>
          )}
        </div>

        {/* ═══ 비교 결과 ═══ */}
        {showResults && compareResult && (
          <section className="space-y-6" aria-label="비교 분석 결과">
            {/* 요약 카드 */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="text-base font-bold mb-6 text-center" style={{ color: "var(--text-primary)" }}>비교 요약</h3>

              {/* 과목 차이 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: "var(--brand-blue)" }}>{compareResult.onlyMine.length}</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>나만 이수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{compareResult.common.length}</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>공통</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: "#db2777" }}>{compareResult.onlyFriend.length}</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>친구만 이수</p>
                </div>
              </div>

              {/* 안정권 비교 바 */}
              <div className="mb-6">
                <p className="text-xs font-semibold mb-2 text-center" style={{ color: "var(--text-secondary)" }}>안정권(80+) 학과 수</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold w-8 text-right" style={{ color: "var(--brand-blue)" }}>
                    {compareResult.myRoadmap.excellent.length}
                  </span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden flex" style={{ background: "var(--surface-2)" }}>
                    {(() => {
                      const total = Math.max(compareResult.myRoadmap.excellent.length + compareResult.friendRoadmap.excellent.length, 1);
                      const myPct = (compareResult.myRoadmap.excellent.length / total) * 100;
                      return (
                        <>
                          <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${myPct}%` }} />
                          <div className="h-full bg-pink-500 rounded-r-full" style={{ width: `${100 - myPct}%` }} />
                        </>
                      );
                    })()}
                  </div>
                  <span className="text-sm font-bold w-8" style={{ color: "#db2777" }}>
                    {compareResult.friendRoadmap.excellent.length}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>나</span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>친구</span>
                </div>
              </div>

              {/* 평균 점수 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4 text-center bg-blue-50">
                  <p className="text-2xl font-bold text-blue-600">{compareResult.myAvgScore}</p>
                  <p className="text-xs text-blue-600">나의 평균</p>
                </div>
                <div className="rounded-xl p-4 text-center bg-pink-50">
                  <p className="text-2xl font-bold text-pink-600">{compareResult.friendAvgScore}</p>
                  <p className="text-xs text-pink-600">친구 평균</p>
                </div>
              </div>
            </div>

            {/* 과목 차이 시각화 */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>과목 차이</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 나만 */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--brand-blue)" }}>나만 이수한 과목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {compareResult.onlyMine.map((s) => (
                      <span key={s} className={`px-2.5 py-1 text-xs font-medium rounded-lg ${CATEGORY_BADGE[categorizeSubject(s)] ?? CATEGORY_BADGE["기타"]}`}>
                        {s}
                      </span>
                    ))}
                    {compareResult.onlyMine.length === 0 && (
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>없음</span>
                    )}
                  </div>
                </div>
                {/* 공통 */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>공통 과목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {compareResult.common.map((s) => (
                      <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {/* 친구만 */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#db2777" }}>친구만 이수한 과목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {compareResult.onlyFriend.map((s) => (
                      <span key={s} className={`px-2.5 py-1 text-xs font-medium rounded-lg ${CATEGORY_BADGE[categorizeSubject(s)] ?? CATEGORY_BADGE["기타"]}`}>
                        {s}
                      </span>
                    ))}
                    {compareResult.onlyFriend.length === 0 && (
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>없음</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 내가 유리한 학과 */}
            {compareResult.myAdvantage.length > 0 && (
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{ background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.15)", boxShadow: "var(--shadow-card)" }}
              >
                <h3 className="text-base font-bold mb-4" style={{ color: "var(--brand-blue)" }}>
                  내가 더 유리한 학과 ({compareResult.myAdvantage.length})
                </h3>
                <div className="space-y-2">
                  {compareResult.myAdvantage.slice(0, 10).map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                      style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
                    >
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {d.university} <span style={{ color: "var(--text-secondary)" }}>· {d.department}</span>
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-blue-600">{d.myScore}</span>
                        <span style={{ color: "var(--text-tertiary)" }}>vs</span>
                        <span className="font-bold text-pink-600">{d.friendScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 친구가 유리한 학과 */}
            {compareResult.friendAdvantage.length > 0 && (
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{ background: "rgba(219, 39, 119, 0.04)", border: "1px solid rgba(219, 39, 119, 0.15)", boxShadow: "var(--shadow-card)" }}
              >
                <h3 className="text-base font-bold mb-4" style={{ color: "#db2777" }}>
                  친구가 더 유리한 학과 ({compareResult.friendAdvantage.length})
                </h3>
                <div className="space-y-2">
                  {compareResult.friendAdvantage.slice(0, 10).map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                      style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
                    >
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {d.university} <span style={{ color: "var(--text-secondary)" }}>· {d.department}</span>
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-blue-600">{d.myScore}</span>
                        <span style={{ color: "var(--text-tertiary)" }}>vs</span>
                        <span className="font-bold text-pink-600">{d.friendScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 면책 조항 */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                본 비교 분석은 대교협 adiga.kr 및 각 대학 입학처 공식 자료를 기반으로 한 참고용 정보입니다.
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
