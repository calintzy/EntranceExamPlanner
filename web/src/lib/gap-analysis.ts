// 맞춤 과목 갭 분석 로직
// 목표 대학/학과 + 현재 수강 과목 → 적합도 점수 + 미이수 과목 경고

import { CourseRecommendationData } from "./types";
import { parseSubjects, normalizeSubject } from "./subject";

// ── 입력 / 출력 인터페이스 ──

export interface GapAnalysisInput {
  targetUniversities: { university: string; department: string }[];
  currentCourses: string[];
}

export interface GapAnalysisResult {
  university: string;
  department: string;
  matchedCore: string[];
  missingCore: string[];
  matchedRec: string[];
  missingRec: string[];
  coverageScore: number;
}

// ── 갭 분석 실행 ──

export function analyzeGap(
  data: CourseRecommendationData,
  input: GapAnalysisInput
): GapAnalysisResult[] {
  const normalizedCurrent = input.currentCourses.map(normalizeSubject);

  return input.targetUniversities.map(({ university, department }) => {
    const dept = data[university]?.[department];
    if (!dept) {
      return {
        university,
        department,
        matchedCore: [],
        missingCore: [],
        matchedRec: [],
        missingRec: [],
        coverageScore: 0,
      };
    }

    const coreSubjects = parseSubjects(dept.core);
    const recSubjects = parseSubjects(dept.recommended);

    const matchedCore = coreSubjects.filter((s) => normalizedCurrent.includes(s));
    const missingCore = coreSubjects.filter((s) => !normalizedCurrent.includes(s));
    const matchedRec = recSubjects.filter((s) => normalizedCurrent.includes(s));
    const missingRec = recSubjects.filter((s) => !normalizedCurrent.includes(s));

    // 점수 계산: 핵심권장 가중치 2, 권장 가중치 1
    const totalWeight = coreSubjects.length * 2 + recSubjects.length;
    const matchedWeight = matchedCore.length * 2 + matchedRec.length;
    const coverageScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

    return {
      university,
      department,
      matchedCore,
      missingCore,
      matchedRec,
      missingRec,
      coverageScore,
    };
  });
}

// ── 점수 등급 판정 ──

export type ScoreGrade = "excellent" | "good" | "warning" | "danger";

export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "warning";
  return "danger";
}

export const GRADE_CONFIG: Record<ScoreGrade, { label: string; color: string; bgColor: string; borderColor: string }> = {
  excellent: { label: "매우 적합", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  good: { label: "적합", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  warning: { label: "보완 필요", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  danger: { label: "부족", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
};

// ── 전체 고유 과목 목록 (체크박스 UI용) ──

export function getAllUniqueSubjects(data: CourseRecommendationData): string[] {
  const subjects = new Set<string>();
  for (const depts of Object.values(data)) {
    for (const courses of Object.values(depts)) {
      for (const s of parseSubjects(courses.core)) subjects.add(s);
      for (const s of parseSubjects(courses.recommended)) subjects.add(s);
    }
  }
  return Array.from(subjects).sort();
}
