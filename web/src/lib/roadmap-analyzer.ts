// 맞춤형 대학 로드맵 분석
// 내 수강 과목으로 전체 대학을 스캔하여 안정/도전/보완/미흡으로 분류

import { CourseRecommendationData } from "./types";
import { parseSubjects, normalizeSubject } from "./subject";
import { getScoreGrade, type ScoreGrade } from "./gap-analysis";

// ── 출력 타입 ──

export interface RoadmapResult {
  university: string;
  department: string;
  coverageScore: number;
  grade: ScoreGrade;
  matchedCore: string[];
  missingCore: string[];
  matchedRec: string[];
  missingRec: string[];
}

export interface RoadmapSummary {
  excellent: RoadmapResult[]; // 80점 이상 — 안정
  good: RoadmapResult[];     // 60~79점 — 도전
  warning: RoadmapResult[];  // 40~59점 — 보완
  danger: RoadmapResult[];   // 0~39점  — 미흡
  totalScanned: number;
}

// ── 전체 대학×학과 스캔 ──

export function analyzeRoadmap(
  data: CourseRecommendationData,
  currentCourses: string[]
): RoadmapSummary {
  // 1. 현재 수강 과목 전체 정규화
  const normalizedCurrent = currentCourses.map(normalizeSubject);

  const results: RoadmapResult[] = [];

  // 2. 모든 대학 → 모든 학과 순회
  for (const university of Object.keys(data)) {
    const deptMap = data[university];
    for (const department of Object.keys(deptMap)) {
      const dept = deptMap[department];

      // 3. 핵심권장 / 권장 과목 파싱 (정규화 포함)
      const coreSubjects = parseSubjects(dept.core);
      const recSubjects = parseSubjects(dept.recommended);

      // 4. 이수 여부 분류
      const matchedCore = coreSubjects.filter((s) => normalizedCurrent.includes(s));
      const missingCore = coreSubjects.filter((s) => !normalizedCurrent.includes(s));
      const matchedRec = recSubjects.filter((s) => normalizedCurrent.includes(s));
      const missingRec = recSubjects.filter((s) => !normalizedCurrent.includes(s));

      // 5. 점수 계산: 핵심권장 가중치 2, 권장 가중치 1 (gap-analysis.ts와 동일)
      const totalWeight = coreSubjects.length * 2 + recSubjects.length;
      const matchedWeight = matchedCore.length * 2 + matchedRec.length;
      const coverageScore =
        totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

      // 6. 등급 판정
      const grade = getScoreGrade(coverageScore);

      results.push({
        university,
        department,
        coverageScore,
        grade,
        matchedCore,
        missingCore,
        matchedRec,
        missingRec,
      });
    }
  }

  // 7. 등급별 분류 후 점수 내림차순 정렬
  const sortDesc = (a: RoadmapResult, b: RoadmapResult) =>
    b.coverageScore - a.coverageScore;

  return {
    excellent: results.filter((r) => r.grade === "excellent").sort(sortDesc),
    good: results.filter((r) => r.grade === "good").sort(sortDesc),
    warning: results.filter((r) => r.grade === "warning").sort(sortDesc),
    danger: results.filter((r) => r.grade === "danger").sort(sortDesc),
    totalScanned: results.length,
  };
}
