"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CourseRecommendationData } from "@/lib/types";
import { categorizeSubject } from "@/lib/subject";
import { searchBySubject } from "@/lib/course-utils";

interface SearchClientProps {
  courseData: CourseRecommendationData;
  allSubjects: string[];
}

export default function SearchClient({
  courseData,
  allSubjects,
}: SearchClientProps) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filterType, setFilterType] = useState<"all" | "core" | "recommended">(
    "all"
  );

  // 카테고리별 과목 그룹핑
  const subjectsByCategory = useMemo(() => {
    const grouped: Record<string, string[]> = {
      수학: [],
      과학: [],
      사회: [],
    };
    for (const s of allSubjects) {
      const cat = categorizeSubject(s);
      if (grouped[cat]) {
        grouped[cat].push(s);
      }
    }
    return grouped;
  }, [allSubjects]);

  // 역방향 검색 결과
  const results = useMemo(() => {
    if (!selectedSubject) return [];
    const all = searchBySubject(courseData, selectedSubject);
    if (filterType === "all") return all;
    return all.filter((r) => r.type === filterType);
  }, [courseData, selectedSubject, filterType]);

  // 핵심/권장 통계
  const stats = useMemo(() => {
    if (!selectedSubject) return { core: 0, recommended: 0, total: 0 };
    const all = searchBySubject(courseData, selectedSubject);
    const core = all.filter((r) => r.type === "core").length;
    const recommended = all.filter((r) => r.type === "recommended").length;
    return { core, recommended, total: all.length };
  }, [courseData, selectedSubject]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
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
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            역방향 검색
          </h1>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded ml-auto">
            내 과목 → 유리한 대학
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 설명 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            과목으로 대학 찾기
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            내가 선택한 과목을 핵심권장 또는 권장하는 대학과 학과를 찾아보세요.
          </p>
        </div>

        {/* 과목 선택 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
            과목 선택
          </label>

          {Object.entries(subjectsByCategory).map(([category, subjects]) => (
            <div key={category} className="mb-4 last:mb-0">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                {category}
              </span>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSubject === subject
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 결과 */}
        {selectedSubject && (
          <div className="space-y-6">
            {/* 통계 + 필터 */}
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                &ldquo;{selectedSubject}&rdquo; 검색 결과
              </h3>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  전체 {stats.total}
                </button>
                <button
                  onClick={() => setFilterType("core")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === "core"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  핵심권장 {stats.core}
                </button>
                <button
                  onClick={() => setFilterType("recommended")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === "recommended"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  권장 {stats.recommended}
                </button>
              </div>
            </div>

            {/* 결과 테이블 */}
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                        대학
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                        학과
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                        구분
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, idx) => (
                      <tr
                        key={`${item.university}-${item.department}`}
                        className={
                          idx < results.length - 1
                            ? "border-b border-slate-100 dark:border-slate-800"
                            : ""
                        }
                      >
                        <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">
                          <Link
                            href={`/university/${encodeURIComponent(item.university)}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {item.university}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                          <Link
                            href={`/university/${encodeURIComponent(item.university)}/${encodeURIComponent(item.department)}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {item.department}
                          </Link>
                        </td>
                        <td className="px-6 py-3">
                          {item.type === "core" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md border border-red-100 dark:border-red-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              핵심권장
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              권장
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                필터 조건에 맞는 결과가 없습니다.
              </div>
            )}

            {/* 과목 상세 페이지 링크 */}
            <div className="text-center">
              <Link
                href={`/subject/${encodeURIComponent(selectedSubject)}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                &ldquo;{selectedSubject}&rdquo; 상세 페이지 보기
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
          </div>
        )}

        {/* 빈 상태 */}
        {!selectedSubject && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
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
            <p className="text-slate-500 dark:text-slate-400">
              과목을 선택하면 해당 과목을 권장하는 대학과 학과를 보여줍니다
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-400 space-y-2">
          <p>
            데이터 출처: 각 대학 입학처 모집요강 및 전공연계 교과이수 안내자료
            (2026학년도)
          </p>
          <p>
            본 서비스는 참고용 정보를 제공하며, 대학 입학 전형의 공식 기준이
            아닙니다.
          </p>
          <p>
            정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처 공식 자료를 통해
            확인하시기 바랍니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
