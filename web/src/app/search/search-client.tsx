"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { CourseRecommendationData } from "@/lib/types";
import { getCleanSubjects } from "@/lib/subject";
import { searchByMultipleSubjects, type MultiSubjectResult } from "@/lib/course-utils";
import { Footer } from "@/components/footer";
import SubjectSearchInput from "@/components/subject-search-input";
import SubjectBrowser from "@/components/subject-browser";

// 전공적합도 점수 계산
function calcFitScore(matches: { type: "core" | "recommended" }[], totalSubjects: number): number {
  if (totalSubjects === 0) return 0;
  const points = matches.reduce((sum, m) => sum + (m.type === "core" ? 2 : 1), 0);
  const max = totalSubjects * 2;
  return Math.round((points / max) * 100);
}

interface SearchClientProps {
  courseData: CourseRecommendationData;
  allSubjects: string[];
}

export default function SearchClient({
  courseData,
  allSubjects,
}: SearchClientProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "core" | "recommended">(
    "all"
  );
  const [browserOpen, setBrowserOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL 파라미터로 초기 과목 설정 (공유 링크)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subjects = params.get("subjects");
    if (subjects) {
      setSelectedSubjects(subjects.split(",").map((s) => decodeURIComponent(s.trim())).filter(Boolean));
    }
  }, []);

  // 정제된 과목 목록 (파싱 오류/중복/파편 제거)
  const cleanSubjects = useMemo(
    () => getCleanSubjects(allSubjects),
    [allSubjects]
  );

  // 과목 추가/제거 핸들러
  const addSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev : [...prev, subject]
    );
  }, []);

  const removeSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) => prev.filter((s) => s !== subject));
  }, []);

  // 브라우저에서 토글 (선택/해제)
  const toggleSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  }, []);

  // 복수 과목 역방향 검색 (AND 교집합)
  const results: MultiSubjectResult[] = useMemo(() => {
    if (selectedSubjects.length === 0) return [];
    const all = searchByMultipleSubjects(courseData, selectedSubjects);
    if (filterType === "all") return all;
    // 필터: 모든 매칭이 해당 타입인 결과만
    if (filterType === "core") {
      return all.filter((r) => r.matches.every((m) => m.type === "core"));
    }
    return all.filter((r) => r.matches.some((m) => m.type === "recommended"));
  }, [courseData, selectedSubjects, filterType]);

  // 통계
  const stats = useMemo(() => {
    if (selectedSubjects.length === 0) return { allCore: 0, hasRec: 0, total: 0 };
    const all = searchByMultipleSubjects(courseData, selectedSubjects);
    const allCore = all.filter((r) => r.matches.every((m) => m.type === "core")).length;
    const hasRec = all.filter((r) => r.matches.some((m) => m.type === "recommended")).length;
    return { allCore, hasRec, total: all.length };
  }, [courseData, selectedSubjects]);

  // 점수 계산된 결과 (적합도 높은 순)
  const scoredResults = useMemo(() => {
    return results.map((r) => ({
      ...r,
      score: calcFitScore(r.matches, selectedSubjects.length),
    })).sort((a, b) => b.score - a.score);
  }, [results, selectedSubjects.length]);

  // 공유 링크 복사
  function copyShareLink() {
    const encoded = selectedSubjects.map((s) => encodeURIComponent(s)).join(",");
    const url = `${window.location.origin}/search?subjects=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const hasSelection = selectedSubjects.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">
            역방향 검색
          </h1>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded ml-auto">
            내 과목 → 유리한 대학
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 설명 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            과목으로 대학 찾기
          </h2>
          <p className="text-slate-600">
            내가 선택한 과목을 <strong>모두</strong> 핵심권장 또는 권장하는 대학과 학과를 찾아보세요.
            <br />
            <span className="text-sm text-slate-500">여러 과목을 선택하면 교집합(AND) 결과를 보여줍니다.</span>
          </p>
        </div>

        {/* 과목 선택 영역 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 space-y-4">
          {/* 검색창 (자동완성 + 인라인 pills) */}
          <SubjectSearchInput
            subjects={cleanSubjects}
            selectedSubjects={selectedSubjects}
            onAdd={addSubject}
            onRemove={removeSubject}
          />

          {/* 선택 요약 */}
          {hasSelection && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {selectedSubjects.length}개 과목 선택됨
              </span>
              <button
                onClick={() => setSelectedSubjects([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                전체 해제
              </button>
            </div>
          )}

          {/* 과목 목록에서 선택 (접이식) */}
          <div className="border-t border-slate-100 pt-3">
            <button
              onClick={() => setBrowserOpen(!browserOpen)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${browserOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              과목 목록에서 선택
              <span className="text-xs text-slate-400">({cleanSubjects.length}개 과목)</span>
            </button>

            {browserOpen && (
              <div className="mt-3 max-h-[360px] overflow-y-auto rounded-lg border border-slate-100 p-3">
                <SubjectBrowser
                  subjects={cleanSubjects}
                  selectedSubjects={selectedSubjects}
                  onToggle={toggleSubject}
                />
              </div>
            )}
          </div>
        </div>

        {/* 결과 */}
        {hasSelection && (
          <div className="space-y-6">
            {/* 통계 + 필터 + 액션 */}
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedSubjects.length === 1
                  ? `\u201C${selectedSubjects[0]}\u201D 검색 결과`
                  : `${selectedSubjects.length}개 과목 교집합 결과`}
              </h3>

              {/* 공유 + 인쇄 버튼 */}
              <div className="flex gap-2 no-print">
                <button
                  onClick={copyShareLink}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                  </svg>
                  {copied ? "복사됨!" : "링크 복사"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                  인쇄
                </button>
              </div>

              <div className="flex gap-2 ml-auto no-print">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  전체 {stats.total}
                </button>
                <button
                  onClick={() => setFilterType("core")}
                  className={`px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === "core"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  모두 핵심권장 {stats.allCore}
                </button>
                <button
                  onClick={() => setFilterType("recommended")}
                  className={`px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === "recommended"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  권장 포함 {stats.hasRec}
                </button>
              </div>
            </div>

            {/* 결과 테이블 + 모바일 카드 */}
            {scoredResults.length > 0 ? (
              <>
                {/* 인쇄용 헤더 (화면에서는 숨김) */}
                <div className="hidden print-only mb-4">
                  <h2 className="text-xl font-bold">역방향 검색 결과 리포트</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    선택 과목: {selectedSubjects.join(", ")} | 결과: {scoredResults.length}개 학과 | 출력일: {new Date().toLocaleDateString("ko-KR")}
                  </p>
                </div>

                {/* 데스크톱 테이블 */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50 w-16">
                          적합도
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50">
                          대학
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50">
                          학과
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50">
                          과목별 구분
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoredResults.map((item, idx) => (
                        <tr
                          key={`${item.university}-${item.department}`}
                          className={
                            idx < scoredResults.length - 1
                              ? "border-b border-slate-100"
                              : ""
                          }
                        >
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold ${
                              item.score === 100
                                ? "bg-green-100 text-green-700"
                                : item.score >= 75
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}>
                              {item.score}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            <Link
                              href={`/university/${encodeURIComponent(item.university)}`}
                              className="hover:text-blue-600"
                            >
                              {item.university}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            <Link
                              href={`/university/${encodeURIComponent(item.university)}/${encodeURIComponent(item.department)}`}
                              className="hover:text-blue-600"
                            >
                              {item.department}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {item.matches.map((m) => (
                                <span
                                  key={m.subject}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${
                                    m.type === "core"
                                      ? "bg-red-50 text-red-700 border-red-100"
                                      : "bg-blue-50 text-blue-700 border-blue-100"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      m.type === "core" ? "bg-red-500" : "bg-blue-500"
                                    }`}
                                  />
                                  {m.subject}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 모바일 카드 리스트 */}
                <div className="md:hidden space-y-3">
                  {scoredResults.map((item) => (
                    <div
                      key={`m-${item.university}-${item.department}`}
                      className="bg-white rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold ${
                          item.score === 100
                            ? "bg-green-100 text-green-700"
                            : item.score >= 75
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.score}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/university/${encodeURIComponent(item.university)}`}
                            className="text-sm font-semibold text-slate-900 hover:text-blue-600"
                          >
                            {item.university}
                          </Link>
                          <Link
                            href={`/university/${encodeURIComponent(item.university)}/${encodeURIComponent(item.department)}`}
                            className="block text-sm text-slate-600 hover:text-blue-600"
                          >
                            {item.department}
                          </Link>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matches.map((m) => (
                          <span
                            key={m.subject}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${
                              m.type === "core"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.type === "core" ? "bg-red-500" : "bg-blue-500"
                              }`}
                            />
                            {m.subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                {selectedSubjects.length >= 2
                  ? "선택한 과목을 모두 권장하는 대학/학과가 없습니다. 과목 수를 줄여보세요."
                  : "필터 조건에 맞는 결과가 없습니다."}
              </div>
            )}

            {/* 단일 과목인 경우 상세 페이지 링크 */}
            {selectedSubjects.length === 1 && (
              <div className="text-center">
                <Link
                  href={`/subject/${encodeURIComponent(selectedSubjects[0])}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  &ldquo;{selectedSubjects[0]}&rdquo; 상세 페이지 보기
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 빈 상태 */}
        {!hasSelection && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-slate-500">
              과목을 선택하면 해당 과목을 권장하는 대학과 학과를 보여줍니다
            </p>
            <p className="text-xs text-slate-400 mt-1">
              여러 과목 선택 시 모두 권장하는 대학만 표시됩니다
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
