"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { CourseRecommendationData } from "@/lib/types";
import {
  categorizeSubject,
  classifyCourseLevel,
  CORE_COLOR_MAP,
  REC_COLOR_MAP,
  LEVEL_COLORS,
} from "@/lib/subject";
import {
  getUniversityList,
  getDepartments,
  getCourseRecommendation,
  compareUniversities,
  getDataLabel,
  getUniversityMeta,
} from "@/lib/course-utils";
import { Footer } from "@/components/footer";
import BackButton from "@/components/back-button";

type ViewMode = "single" | "compare";

interface GuideClientProps {
  courseData: CourseRecommendationData;
}

// ── 대학 지역 그룹핑 ──
interface RegionGroup {
  region: string;
  universities: string[];
}

// 초기 6개 대학(location 없음)은 서울로 분류
function getUnivLocation(univ: string): string {
  const meta = getUniversityMeta(univ);
  if (meta?.location) return meta.location;
  // 초기 6개: 경희대, 고려대, 서울대, 성균관대, 연세대, 중앙대
  return "서울";
}

const REGION_ORDER = ["서울", "경기", "인천", "강원", "대전", "충남", "충북", "대구", "부산", "경북", "경남", "광주", "전북", "전남"];
const REGION_DISPLAY: Record<string, string> = {
  "서울": "서울",
  "경기": "경기",
  "인천": "인천",
  "강원": "강원",
  "대전": "대전/충남",
  "충남": "대전/충남",
  "충북": "충북",
  "대구": "대구/경북",
  "경북": "대구/경북",
  "부산": "부산/경남",
  "경남": "부산/경남",
  "광주": "광주/전남",
  "전남": "광주/전남",
  "전북": "전북",
};

function groupByRegion(universities: string[]): RegionGroup[] {
  const map = new Map<string, string[]>();

  for (const univ of universities) {
    const loc = getUnivLocation(univ);
    const display = REGION_DISPLAY[loc] || loc;
    if (!map.has(display)) map.set(display, []);
    map.get(display)!.push(univ);
  }

  // 지역 정렬 (서울 → 경기 → ... 순)
  const displayOrder = [...new Set(REGION_ORDER.map((r) => REGION_DISPLAY[r] || r))];

  const groups: RegionGroup[] = [];
  for (const region of displayOrder) {
    const univs = map.get(region);
    if (univs && univs.length > 0) {
      groups.push({ region, universities: univs.sort() });
    }
  }
  // 미분류 추가
  for (const [region, univs] of map) {
    if (!groups.some((g) => g.region === region)) {
      groups.push({ region, universities: univs.sort() });
    }
  }

  return groups;
}

// ── 대학 프리셋 그룹 (비교 모드 필터) ──
const UNIV_GROUPS = [
  { label: "SKY", universities: ["서울대", "연세대", "고려대"] },
  { label: "서성한", universities: ["서강대", "성균관대", "한양대"] },
  { label: "중경외시", universities: ["중앙대", "경희대", "한국외대", "서울시립대"] },
  { label: "건동홍", universities: ["건국대", "동국대", "홍익대"] },
];

export default function GuideClient({ courseData }: GuideClientProps) {
  const [selectedUniv, setSelectedUniv] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [univSearch, setUnivSearch] = useState("");
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(["서울"]));
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");

  const universities = useMemo(
    () => getUniversityList(courseData),
    [courseData]
  );

  const regionGroups = useMemo(
    () => groupByRegion(universities),
    [universities]
  );

  // 대학 검색 필터
  const filteredRegionGroups = useMemo(() => {
    if (!univSearch.trim()) return regionGroups;
    const q = univSearch.trim().toLowerCase();
    return regionGroups
      .map((g) => ({
        ...g,
        universities: g.universities.filter((u) => u.toLowerCase().includes(q)),
      }))
      .filter((g) => g.universities.length > 0);
  }, [regionGroups, univSearch]);

  const departments = useMemo(
    () => (selectedUniv ? getDepartments(courseData, selectedUniv) : []),
    [courseData, selectedUniv]
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
        ? getCourseRecommendation(courseData, selectedUniv, selectedDept)
        : null,
    [courseData, selectedUniv, selectedDept]
  );

  const comparison = useMemo(() => {
    if (viewMode !== "compare" || !selectedDept) return [];
    const keyword = selectedDept.replace(/학과|학부|전공|계열|대학/g, "");
    return compareUniversities(courseData, keyword);
  }, [courseData, viewMode, selectedDept]);

  const yearLabel = selectedUniv ? getDataLabel(selectedUniv) : "";

  // 선택 완료 시 결과 영역으로 스크롤
  useEffect(() => {
    if (recommendation && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [recommendation]);

  // URL 파라미터로 초기 상태 설정 (공유 링크)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const dept = params.get("dept");
    const univ = params.get("univ");

    if (mode === "compare" && dept) {
      setViewMode("compare");
      setSelectedDept(dept);
      if (univ) setSelectedUniv(univ);
    } else if (univ) {
      setSelectedUniv(univ);
      if (dept) setSelectedDept(dept);
    }
  }, []);

  function handleUnivChange(univ: string) {
    setSelectedUniv(univ);
    setSelectedDept("");
    setSearchKeyword("");
    setUnivSearch("");
  }

  function resetSelection() {
    setSelectedUniv("");
    setSelectedDept("");
    setSearchKeyword("");
    setUnivSearch("");
    setSelectedGroup("");
  }

  // 공유 링크 복사
  function copyShareLink() {
    const params = new URLSearchParams();
    if (viewMode === "compare") {
      params.set("mode", "compare");
      if (selectedDept) params.set("dept", selectedDept);
      if (selectedUniv) params.set("univ", selectedUniv);
    } else {
      if (selectedUniv) params.set("univ", selectedUniv);
      if (selectedDept) params.set("dept", selectedDept);
    }
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // 그룹 필터가 적용된 비교 결과
  const filteredComparison = useMemo(() => {
    if (!selectedGroup) return comparison;
    const group = UNIV_GROUPS.find((g) => g.label === selectedGroup);
    if (!group) return comparison;
    return comparison.filter((item) =>
      group.universities.some((u) => item.university.includes(u) || u.includes(item.university))
    );
  }, [comparison, selectedGroup]);

  function toggleRegion(region: string) {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  }

  // 결과가 표시되는 상태인지
  const showResult = viewMode === "single" && recommendation;
  const showCompare = viewMode === "compare" && selectedDept && comparison.length > 0;
  // 빈 필터 결과도 showCompare 유지 (그룹 필터 전환 가능하도록)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 헤더 */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <BackButton fallbackHref="/" />
          <h1 className="text-lg font-bold text-slate-900">교과 선택 가이드</h1>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded ml-auto">
            {yearLabel || "2026 · 2028학년도"}
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
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            학과별 조회
          </button>
          <button
            onClick={() => setViewMode("compare")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "compare"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            대학간 비교
          </button>
        </div>

        {/* ─── 결과 표시 상태: 선택 pill + 결과 ─── */}
        {(showResult || showCompare) ? (
          <div ref={resultRef} className="space-y-6">
            {/* 선택 요약 pill */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">선택:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium">
                  {selectedUniv}
                  <button
                    onClick={resetSelection}
                    className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                    aria-label="대학 변경"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700 text-white text-sm font-medium">
                  {selectedDept}
                  <button
                    onClick={() => setSelectedDept("")}
                    className="hover:bg-slate-800 rounded-full p-0.5 transition-colors"
                    aria-label="학과 변경"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
                <button
                  onClick={copyShareLink}
                  className={`ml-auto text-xs transition-colors ${
                    copied ? "text-green-600" : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  {copied ? "복사됨!" : "링크 복사"}
                </button>
                <button
                  onClick={resetSelection}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  다시 선택
                </button>
              </div>
            </div>

            {/* 단일 조회 결과 */}
            {showResult && recommendation && (
              <>
                {/* 핵심권장과목 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <h3 className="text-base font-semibold text-slate-900">핵심권장과목</h3>
                    <span className="text-xs text-slate-500 ml-2">반드시 이수해야 하는 과목</span>
                  </div>
                  {recommendation.core.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recommendation.core.map((subject, i) => {
                        const category = categorizeSubject(subject);
                        const level = classifyCourseLevel(subject);
                        return (
                          <span key={i} className="inline-flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${CORE_COLOR_MAP[category]}`}>
                              {subject}
                            </span>
                            {level && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${LEVEL_COLORS[level]}`}>
                                {level}
                              </span>
                            )}
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
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-base font-semibold text-slate-900">권장과목</h3>
                    <span className="text-xs text-slate-500 ml-2">이수하면 유리한 과목</span>
                  </div>
                  {recommendation.recommended.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recommendation.recommended.map((subject, i) => {
                        const category = categorizeSubject(subject);
                        const level = classifyCourseLevel(subject);
                        return (
                          <span key={i} className="inline-flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm border ${REC_COLOR_MAP[category]}`}>
                              {subject}
                            </span>
                            {level && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${LEVEL_COLORS[level]}`}>
                                {level}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">추가 권장과목이 없습니다.</p>
                  )}
                </div>

                {/* 안내 메시지 */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    <strong>참고:</strong> 권장과목 미이수가 지원 자격을 제한하지는 않지만,
                    학생부종합전형 서류평가와 정시 교과평가에서 불이익이 있을 수 있습니다.
                  </p>
                </div>
              </>
            )}

            {/* 대학간 비교 결과 */}
            {showCompare && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    &ldquo;{selectedDept}&rdquo; 대학간 비교
                  </h2>
                  <span className="text-sm text-slate-500">
                    {filteredComparison.length}개 대학
                  </span>
                </div>

                {/* 그룹 필터 */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGroup("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      !selectedGroup
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    전체
                  </button>
                  {UNIV_GROUPS.map((group) => {
                    const count = comparison.filter((item) =>
                      group.universities.some((u) => item.university.includes(u) || u.includes(item.university))
                    ).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={group.label}
                        onClick={() => setSelectedGroup(selectedGroup === group.label ? "" : group.label)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedGroup === group.label
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        {group.label} {count}
                      </button>
                    );
                  })}
                </div>

                {/* 데스크톱 테이블 */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 bg-slate-50">대학</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 bg-slate-50">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" />핵심권장과목
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 bg-slate-50">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />권장과목
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComparison.map((item, idx) => (
                        <tr
                          key={`${item.university}-${item.matchedDept}`}
                          className={idx < filteredComparison.length - 1 ? "border-b border-slate-100" : ""}
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">{item.university}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {item.core.length > 0 ? item.core.map((s, i) => (
                                <span key={i} className="inline-block px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md border border-red-100">{s}</span>
                              )) : <span className="text-xs text-slate-400">없음</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {item.recommended.length > 0 ? item.recommended.map((s, i) => (
                                <span key={i} className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">{s}</span>
                              )) : <span className="text-xs text-slate-400">없음</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 모바일 비교 카드 */}
                <div className="md:hidden space-y-3">
                  {filteredComparison.map((item) => (
                    <div
                      key={`m-${item.university}-${item.matchedDept}`}
                      className="bg-white rounded-xl border border-slate-200 p-4"
                    >
                      <div className="text-sm font-semibold text-slate-900 mb-3">
                        {item.university} · {item.matchedDept}
                      </div>
                      {item.core.length > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs font-medium text-slate-500">핵심권장</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.core.map((s, i) => (
                              <span key={i} className="inline-block px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md border border-red-100">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.recommended.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-medium text-slate-500">권장</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.recommended.map((s, i) => (
                              <span key={i} className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.core.length === 0 && item.recommended.length === 0 && (
                        <span className="text-xs text-slate-400">지정된 권장과목 없음</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* ─── 선택 영역: 대학+학과 선택 ─── */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 대학 선택 */}
              <div>
                {/* 모바일: 대학 선택 완료 시 접힌 요약 표시 */}
                {selectedUniv ? (
                  <div className="md:hidden mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {viewMode === "single" ? "1. 대학 선택" : "1. 기준 대학 선택"}
                    </label>
                    <button
                      onClick={() => handleUnivChange("")}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                          {selectedUniv.charAt(0)}
                        </span>
                        <span className="text-sm font-semibold text-blue-900">{selectedUniv}</span>
                      </span>
                      <span className="text-xs text-blue-600">변경</span>
                    </button>
                  </div>
                ) : null}

                {/* 대학 목록: 데스크톱은 항상 표시, 모바일은 미선택 시만 표시 */}
                <div className={selectedUniv ? "hidden md:block" : ""}>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    {viewMode === "single" ? "1. 대학 선택" : "1. 기준 대학 선택"}
                  </label>

                  {/* 대학 검색 */}
                  <div className="relative mb-3">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="대학명 검색..."
                      value={univSearch}
                      onChange={(e) => setUnivSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 지역별 아코디언 */}
                  <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
                    {filteredRegionGroups.map((group) => {
                      const isExpanded = expandedRegions.has(group.region) || univSearch.trim().length > 0;
                      return (
                        <div key={group.region}>
                          <button
                            onClick={() => toggleRegion(group.region)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                          >
                            <svg
                              className={`shrink-0 w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium text-slate-800">{group.region}</span>
                            <span className="text-xs text-slate-400 ml-auto">{group.universities.length}개</span>
                          </button>
                          {isExpanded && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-6 pb-2">
                              {group.universities.map((univ) => (
                                <button
                                  key={univ}
                                  onClick={() => handleUnivChange(univ)}
                                  className={`px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                                    selectedUniv === univ
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  {univ}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {filteredRegionGroups.length === 0 && (
                      <p className="text-sm text-slate-500 py-4 text-center">
                        &ldquo;{univSearch}&rdquo;에 해당하는 대학이 없습니다
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 학과 선택 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  2. 학과 선택
                </label>
                {selectedUniv ? (
                  <>
                    <div className="hidden md:flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {selectedUniv}
                      </span>
                      <span className="text-xs text-slate-400">{departments.length}개 학과</span>
                    </div>
                    <div className="flex md:hidden items-center gap-2 mb-3">
                      <span className="text-xs text-slate-400">{departments.length}개 학과</span>
                    </div>
                    <input
                      type="text"
                      placeholder="학과 검색..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full px-3 py-2 mb-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="max-h-[340px] overflow-y-auto space-y-0.5">
                      {filteredDepartments.map((dept) => (
                        <button
                          key={dept}
                          onClick={() => setSelectedDept(dept)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            selectedDept === dept
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {dept}
                        </button>
                      ))}
                      {filteredDepartments.length === 0 && searchKeyword && (
                        <p className="text-sm text-slate-500 py-4 text-center">
                          &ldquo;{searchKeyword}&rdquo; 결과 없음
                        </p>
                      )}
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
        )}

        {/* 빈 상태 (결과도 선택도 아닌 경우) */}
        {!showResult && !showCompare && !selectedUniv && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-500">
              {viewMode === "single"
                ? "대학과 학과를 선택하면 권장과목을 안내합니다"
                : "대학과 학과를 선택하면 다른 대학과 비교합니다"}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
