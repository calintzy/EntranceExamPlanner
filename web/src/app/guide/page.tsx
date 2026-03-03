"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  courseData,
  universities,
  getDepartments,
  getCourseRecommendation,
  categorizeSubject,
  compareUniversities,
} from "@/lib/course-data";

type ViewMode = "single" | "compare";

export default function GuidePage() {
  const [selectedUniv, setSelectedUniv] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [searchKeyword, setSearchKeyword] = useState("");

  const departments = useMemo(
    () => (selectedUniv ? getDepartments(selectedUniv) : []),
    [selectedUniv]
  );

  const filteredDepartments = useMemo(
    () =>
      searchKeyword
        ? departments.filter((d) => d.includes(searchKeyword))
        : departments,
    [departments, searchKeyword]
  );

  const recommendation = useMemo(
    () =>
      selectedUniv && selectedDept
        ? getCourseRecommendation(selectedUniv, selectedDept)
        : null,
    [selectedUniv, selectedDept]
  );

  const comparison = useMemo(() => {
    if (viewMode !== "compare" || !selectedDept) return [];
    // 학과명에서 키워드 추출
    const keyword = selectedDept.replace(/학과|학부|전공|계열|대학/g, "");
    return compareUniversities(keyword);
  }, [viewMode, selectedDept]);

  function handleUnivChange(univ: string) {
    setSelectedUniv(univ);
    setSelectedDept("");
    setSearchKeyword("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* 헤더 */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            교과 선택 가이드
          </h1>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded ml-auto">
            2026학년도
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 모드 선택 */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setViewMode("single")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "single"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            학과별 조회
          </button>
          <button
            onClick={() => setViewMode("compare")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "compare"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            대학간 비교
          </button>
        </div>

        {/* 선택 영역 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 대학 선택 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {viewMode === "single" ? "1. 대학 선택" : "1. 기준 대학 선택"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {universities.map((univ) => (
                  <button
                    key={univ}
                    onClick={() => handleUnivChange(univ)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedUniv === univ
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {univ}
                  </button>
                ))}
              </div>
            </div>

            {/* 학과 선택 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                2. 학과 선택
              </label>
              {selectedUniv ? (
                <>
                  <input
                    type="text"
                    placeholder="학과 검색..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full px-3 py-2 mb-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredDepartments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedDept === dept
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-32 text-sm text-slate-400">
                  대학을 먼저 선택하세요
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 결과 - 단일 조회 */}
        {viewMode === "single" && recommendation && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedUniv} {selectedDept}
              </h2>
            </div>

            {/* 핵심권장과목 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  핵심권장과목
                </h3>
                <span className="text-xs text-slate-500 ml-2">
                  반드시 이수해야 하는 과목
                </span>
              </div>
              {recommendation.core.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recommendation.core.map((subject, i) => {
                    const category = categorizeSubject(subject);
                    const colorMap: Record<string, string> = {
                      "수학": "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800",
                      "과학": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                      "사회": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                      "기타": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
                    };
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${colorMap[category]}`}
                      >
                        {subject}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  지정된 핵심권장과목이 없습니다. 진로/적성에 맞는 과목을 자유롭게 선택하세요.
                </p>
              )}
            </div>

            {/* 권장과목 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  권장과목
                </h3>
                <span className="text-xs text-slate-500 ml-2">
                  이수하면 유리한 과목
                </span>
              </div>
              {recommendation.recommended.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recommendation.recommended.map((subject, i) => {
                    const category = categorizeSubject(subject);
                    const colorMap: Record<string, string> = {
                      "수학": "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-100 dark:border-violet-900",
                      "과학": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
                      "사회": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900",
                      "기타": "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-100 dark:border-slate-800",
                    };
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm border ${colorMap[category]}`}
                      >
                        {subject}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  추가 권장과목이 없습니다.
                </p>
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>참고:</strong> 권장과목 미이수가 지원 자격을 제한하지는 않지만, 학생부종합전형 서류평가와 정시 교과평가에서 불이익이 있을 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 결과 - 대학간 비교 */}
        {viewMode === "compare" && selectedDept && comparison.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              &ldquo;{selectedDept}&rdquo; 대학간 비교
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                      대학
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        핵심권장과목
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        권장과목
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((item, idx) => (
                    <tr
                      key={item.university}
                      className={idx < comparison.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {item.university}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.core.length > 0 ? (
                            item.core.map((s, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-1 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md border border-red-100 dark:border-red-900"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">없음</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.recommended.length > 0 ? (
                            item.recommended.map((s, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-900"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">없음</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {comparison.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                해당 학과를 보유한 대학이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 빈 상태 */}
        {!recommendation && viewMode === "single" && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              대학과 학과를 선택하면 권장과목을 안내합니다
            </p>
          </div>
        )}

        {viewMode === "compare" && !selectedDept && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              대학과 학과를 선택하면 다른 대학과 비교합니다
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-400 space-y-2">
          <p>데이터 출처: 각 대학 입학처 모집요강 및 전공연계 교과이수 안내자료 (2026학년도)</p>
          <p>본 서비스는 참고용 정보를 제공하며, 대학 입학 전형의 공식 기준이 아닙니다.</p>
          <p>정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처 공식 자료를 통해 확인하시기 바랍니다.</p>
        </div>
      </footer>
    </div>
  );
}
