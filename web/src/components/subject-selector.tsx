"use client";

import { useState, useMemo, useCallback } from "react";
import { categorizeSubject, isValidSubject, normalizeSubject } from "@/lib/subject";

// ── 카테고리 정렬 순서 ──
const CATEGORY_ORDER = ["수학", "과학", "사회", "언어", "정보", "기타"];

// 카테고리별 비선택 상태 색상 (배경 연한 색)
const CATEGORY_COLORS: Record<string, string> = {
  수학: "border-violet-300 bg-violet-50 text-violet-800",
  과학: "border-emerald-300 bg-emerald-50 text-emerald-800",
  사회: "border-amber-300 bg-amber-50 text-amber-800",
  언어: "border-rose-300 bg-rose-50 text-rose-800",
  정보: "border-cyan-300 bg-cyan-50 text-cyan-800",
  기타: "border-slate-300 bg-slate-50 text-slate-800",
};

// 카테고리별 선택 상태 색상 (배경 진한 색 + 흰 글씨)
const CATEGORY_SELECTED: Record<string, string> = {
  수학: "border-violet-500 bg-violet-600 text-white",
  과학: "border-emerald-500 bg-emerald-600 text-white",
  사회: "border-amber-500 bg-amber-600 text-white",
  언어: "border-rose-500 bg-rose-600 text-white",
  정보: "border-cyan-500 bg-cyan-600 text-white",
  기타: "border-slate-500 bg-slate-600 text-white",
};

// ── 과목 카테고리 그룹핑 ──
// isValidSubject 필터 후 categorizeSubject로 카테고리 분류
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

interface SubjectSelectorProps {
  // 선택 가능한 전체 과목 목록
  allSubjects: string[];
  // 현재 선택된 과목 집합 (정규화된 과목명 기준)
  selectedCourses: Set<string>;
  // 과목 버튼 클릭 시 호출 (원본 과목명 전달, 정규화는 내부 또는 부모에서 처리)
  onToggle: (subject: string) => void;
  // 섹션 제목 (기본값: "현재 수강 · 예정 과목")
  label?: string;
  // 섹션 설명 (기본값: "이수했거나 수강 예정인 과목을 모두 선택하세요")
  description?: string;
  // 단계 번호 표시 (선택적, 없으면 원형 번호 숨김)
  showStepNumber?: number;
  // 단계 활성화 여부 (비활성 시 번호 원형을 회색으로 표시, 기본 true)
  isActive?: boolean;
}

export default function SubjectSelector({
  allSubjects,
  selectedCourses,
  onToggle,
  label = "현재 수강 · 예정 과목",
  description = "이수했거나 수강 예정인 과목을 모두 선택하세요",
  showStepNumber,
  isActive = true,
}: SubjectSelectorProps) {
  // 카테고리 아코디언 열림 상태 (열린 카테고리명 Set)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // 카테고리별 과목 그룹 (allSubjects 변경 시만 재계산)
  const subjectGroups = useMemo(() => groupByCategory(allSubjects), [allSubjects]);

  // 카테고리 아코디언 토글 핸들러
  const toggleCategory = useCallback((cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  // 단계 번호 원형의 배경/글씨 색 결정
  const stepBg = isActive ? "var(--brand-blue)" : "var(--surface-2)";
  const stepColor = isActive ? "white" : "var(--text-tertiary)";

  return (
    <section
      className="rounded-2xl p-6 md:p-8 mb-6"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* 섹션 헤더 */}
      <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        {/* 단계 번호가 지정된 경우만 원형 표시 */}
        {showStepNumber !== undefined && (
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2"
            style={{ background: stepBg, color: stepColor }}
          >
            {showStepNumber}
          </span>
        )}
        {label}
      </h2>

      {/* 설명 + 선택된 과목 수 */}
      <p className="text-xs mb-5 ml-8" style={{ color: "var(--text-tertiary)" }}>
        {description}
        {selectedCourses.size > 0 && (
          <span
            className="ml-2 font-semibold"
            style={{ color: "var(--brand-blue)" }}
          >
            {selectedCourses.size}개 선택됨
          </span>
        )}
      </p>

      {/* 카테고리 아코디언 목록 */}
      <div className="space-y-2 ml-8">
        {CATEGORY_ORDER.filter((cat) => subjectGroups[cat]).map((cat) => {
          const isOpen = openCategories.has(cat);
          // 해당 카테고리에서 선택된 과목 수 (정규화 기준 비교)
          const selectedInCat = subjectGroups[cat].filter(
            (s) => selectedCourses.has(normalizeSubject(s))
          ).length;

          return (
            <div
              key={cat}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--border-medium)" }}
            >
              {/* 카테고리 헤더 버튼 */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)" }}
                aria-expanded={isOpen}
                aria-controls={`subject-cat-${cat}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {cat}
                  </span>
                  {/* 전체 과목 수 뱃지 */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-1)", color: "var(--text-tertiary)" }}
                  >
                    {subjectGroups[cat].length}개
                  </span>
                  {/* 선택된 과목 수 뱃지 (선택 시만 표시) */}
                  {selectedInCat > 0 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "rgba(26, 86, 219, 0.1)", color: "var(--brand-blue)" }}
                    >
                      {selectedInCat}개 선택
                    </span>
                  )}
                </div>
                {/* 펼침/접힘 화살표 */}
                <svg
                  className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  style={{ color: "var(--text-tertiary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 과목 버튼 목록 (아코디언 열릴 때만 렌더링) */}
              {isOpen && (
                <div
                  id={`subject-cat-${cat}`}
                  className="px-4 py-3 flex flex-wrap gap-2"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  {subjectGroups[cat].map((subject) => {
                    const selected = selectedCourses.has(normalizeSubject(subject));
                    return (
                      <button
                        key={subject}
                        onClick={() => onToggle(subject)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          selected ? CATEGORY_SELECTED[cat] : CATEGORY_COLORS[cat]
                        }`}
                        aria-pressed={selected}
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
  );
}
