"use client";

import { useState, useMemo } from "react";
import {
  categorizeSubject,
  classifyCourseLevel,
  groupSubjectsByFamily,
  CORE_COLOR_MAP,
  LEVEL_COLORS,
  type CourseLevel,
  type SubjectFamily,
} from "@/lib/subject";

interface SubjectBrowserProps {
  subjects: string[];
  selectedSubjects: string[];
  onToggle: (subject: string) => void;
}

type CategoryTab = "전체" | "수학" | "과학" | "사회" | "언어" | "정보" | "기타";
type LevelFilter = "전체" | CourseLevel;

const CATEGORY_TABS: CategoryTab[] = ["전체", "수학", "과학", "사회", "언어", "정보", "기타"];
const LEVEL_FILTERS: { value: LevelFilter; label: string }[] = [
  { value: "전체", label: "전체" },
  { value: "일반선택", label: "일반선택" },
  { value: "진로선택", label: "진로선택" },
  { value: "융합선택", label: "융합선택" },
];

export default function SubjectBrowser({
  subjects,
  selectedSubjects,
  onToggle,
}: SubjectBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("전체");
  const [activeLevel, setActiveLevel] = useState<LevelFilter>("전체");
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  // 카테고리 + 레벨 필터 적용
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (activeCategory !== "전체" && categorizeSubject(s) !== activeCategory) return false;
      if (activeLevel !== "전체" && classifyCourseLevel(s) !== activeLevel) return false;
      return true;
    });
  }, [subjects, activeCategory, activeLevel]);

  // 계열 그룹핑
  const families = useMemo(
    () => groupSubjectsByFamily(filteredSubjects),
    [filteredSubjects]
  );

  // 카테고리별 개수 (탭에 표시)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of CATEGORY_TABS) {
      if (tab === "전체") {
        counts[tab] = subjects.length;
      } else {
        counts[tab] = subjects.filter((s) => categorizeSubject(s) === tab).length;
      }
    }
    return counts;
  }, [subjects]);

  function toggleFamily(representative: string) {
    setExpandedFamilies((prev) => {
      if (prev.has(representative)) {
        // 이미 열려있으면 닫기
        return new Set();
      }
      // 다른 계열 접고 이것만 열기
      return new Set([representative]);
    });
  }

  return (
    <div className="space-y-3">
      {/* 레벨 필터 */}
      <div className="flex gap-1.5">
        {LEVEL_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveLevel(value)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeLevel === value
                ? value === "전체"
                  ? "bg-slate-700 text-white"
                  : `border ${LEVEL_COLORS[value as CourseLevel]} font-semibold`
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 모바일: 가로 스크롤 카테고리 pill */}
      <div className="sm:hidden flex overflow-x-auto gap-1.5 pb-2 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_TABS.map((tab) => {
          const count = categoryCounts[tab] || 0;
          if (tab !== "전체" && count === 0) return null;
          return (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === tab
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab} {count}
            </button>
          );
        })}
      </div>

      {/* 2패널 레이아웃 */}
      <div className="flex border border-slate-200 rounded-lg overflow-hidden">
        {/* 왼쪽: 카테고리 네비게이션 (sm 이상만 표시) */}
        <div className="hidden sm:block w-28 shrink-0 border-r border-slate-200 bg-slate-50">
          {CATEGORY_TABS.map((tab) => {
            const count = categoryCounts[tab] || 0;
            if (tab !== "전체" && count === 0) return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`w-full px-3 py-2.5 text-xs font-medium text-left transition-colors flex items-center justify-between ${
                  activeCategory === tab
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] ${activeCategory === tab ? "opacity-60" : "text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 오른쪽: 과목 목록 */}
        <div className="flex-1 overflow-y-auto">
          {families.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              조건에 맞는 과목이 없습니다
            </p>
          ) : (
            <div className="py-1">
              {families.map((family) => (
                <FamilyItem
                  key={family.representative}
                  family={family}
                  isExpanded={expandedFamilies.has(family.representative)}
                  onToggle={() => toggleFamily(family.representative)}
                  selectedSubjects={selectedSubjects}
                  onSelect={onToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 계열 그룹 / 단독 항목 ──
function FamilyItem({
  family,
  isExpanded,
  onToggle,
  selectedSubjects,
  onSelect,
}: {
  family: SubjectFamily;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSubjects: string[];
  onSelect: (s: string) => void;
}) {
  const isSingle = family.members.length === 1;
  const categoryColor = CORE_COLOR_MAP[family.category] || CORE_COLOR_MAP["기타"];
  const hasSelectedMember = family.members.some((m) => selectedSubjects.includes(m));

  // 단독 과목 → 직접 토글
  if (isSingle) {
    const subject = family.members[0];
    const isSelected = selectedSubjects.includes(subject);
    const level = classifyCourseLevel(subject);

    return (
      <button
        onClick={() => onSelect(subject)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
          isSelected
            ? "bg-blue-600 text-white"
            : "hover:bg-slate-50 text-slate-700"
        }`}
      >
        <span
          className={`shrink-0 w-2 h-2 rounded-full ${
            isSelected ? "bg-white" : categoryColor.split(" ")[0]
          }`}
        />
        <span className="flex-1">{subject}</span>
        {level && !isSelected && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
            {level === "일반선택" ? "일반" : level === "진로선택" ? "진로" : level === "융합선택" ? "융합" : level}
          </span>
        )}
        {isSelected && (
          <svg className="shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    );
  }

  // 계열 그룹 → 아코디언
  const selectedCount = family.members.filter((m) => selectedSubjects.includes(m)).length;

  return (
    <div className={`rounded-lg ${hasSelectedMember ? "bg-blue-50/50" : ""}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left hover:bg-slate-50 transition-colors"
      >
        <svg
          className={`shrink-0 w-3.5 h-3.5 text-slate-400 transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span
          className={`shrink-0 w-2 h-2 rounded-full ${categoryColor.split(" ")[0]}`}
        />
        <span className="flex-1 font-medium text-slate-800">
          {family.representative}
        </span>
        {selectedCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
            {selectedCount}
          </span>
        )}
        <span className="text-[10px] text-slate-400">
          {family.members.length}개
        </span>
      </button>

      {isExpanded && (
        <div className="pl-8 pb-1 space-y-0.5">
          {family.members.map((subject) => {
            const isSelected = selectedSubjects.includes(subject);
            const level = classifyCourseLevel(subject);

            return (
              <button
                key={subject}
                onClick={() => onSelect(subject)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-left transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span className="flex-1">{subject}</span>
                {level && !isSelected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                    {level === "일반선택" ? "일반" : level === "진로선택" ? "진로" : level === "융합선택" ? "융합" : level}
                  </span>
                )}
                {isSelected && (
                  <svg className="shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
