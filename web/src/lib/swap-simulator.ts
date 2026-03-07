// 과목 교체 시뮬레이터
// 현재 과목에서 하나를 빼고 다른 과목을 넣었을 때 전체 대학 로드맵 변화 분석

import { CourseRecommendationData } from "./types";
import { analyzeRoadmap, type RoadmapSummary, type RoadmapResult } from "./roadmap-analyzer";
import { type ScoreGrade } from "./gap-analysis";

// ── 출력 인터페이스 ──

export interface SwapDeptChange {
  university: string;
  department: string;
  beforeScore: number;
  afterScore: number;
  beforeGrade: ScoreGrade;
  afterGrade: ScoreGrade;
}

export interface SwapResult {
  before: RoadmapSummary;
  after: RoadmapSummary;
  gained: SwapDeptChange[];  // 등급이 올라간 학과
  lost: SwapDeptChange[];    // 등급이 내려간 학과
  improved: SwapDeptChange[]; // 같은 등급이지만 점수 오른 학과
  worsened: SwapDeptChange[]; // 같은 등급이지만 점수 내린 학과
  netChange: number;          // (gained - lost) 학과 수 차이
  avgScoreDiff: number;       // 전체 평균 점수 변화
}

// ── 등급 순서 (비교용) ──
const GRADE_ORDER: Record<ScoreGrade, number> = {
  danger: 0,
  warning: 1,
  good: 2,
  excellent: 3,
};

// ── 전체 결과를 플랫 배열로 변환 ──
function flattenResults(summary: RoadmapSummary): RoadmapResult[] {
  return [
    ...summary.excellent,
    ...summary.good,
    ...summary.warning,
    ...summary.danger,
  ];
}

// ── 평균 점수 계산 ──
function calcAvg(results: RoadmapResult[]): number {
  if (results.length === 0) return 0;
  return results.reduce((sum, r) => sum + r.coverageScore, 0) / results.length;
}

// ── 과목 교체 시뮬레이션 ──

export function simulateSwap(
  data: CourseRecommendationData,
  currentCourses: string[],
  dropSubject: string,
  addSubject: string
): SwapResult {
  // 교체 후 과목 리스트 생성
  const afterCourses = currentCourses
    .filter((c) => c !== dropSubject)
    .concat(addSubject);

  // analyzeRoadmap 2회 호출
  const before = analyzeRoadmap(data, currentCourses);
  const after = analyzeRoadmap(data, afterCourses);

  // 플랫 배열로 변환하여 학과별 비교
  const beforeFlat = flattenResults(before);
  const afterFlat = flattenResults(after);

  // 학과별 매핑 (key: "대학|학과")
  const beforeMap = new Map<string, RoadmapResult>();
  for (const r of beforeFlat) {
    beforeMap.set(`${r.university}|${r.department}`, r);
  }

  const gained: SwapDeptChange[] = [];
  const lost: SwapDeptChange[] = [];
  const improved: SwapDeptChange[] = [];
  const worsened: SwapDeptChange[] = [];

  for (const afterResult of afterFlat) {
    const key = `${afterResult.university}|${afterResult.department}`;
    const beforeResult = beforeMap.get(key);
    if (!beforeResult) continue;

    const beforeGradeOrder = GRADE_ORDER[beforeResult.grade];
    const afterGradeOrder = GRADE_ORDER[afterResult.grade];

    const change: SwapDeptChange = {
      university: afterResult.university,
      department: afterResult.department,
      beforeScore: beforeResult.coverageScore,
      afterScore: afterResult.coverageScore,
      beforeGrade: beforeResult.grade,
      afterGrade: afterResult.grade,
    };

    if (afterGradeOrder > beforeGradeOrder) {
      gained.push(change);
    } else if (afterGradeOrder < beforeGradeOrder) {
      lost.push(change);
    } else if (afterResult.coverageScore > beforeResult.coverageScore) {
      improved.push(change);
    } else if (afterResult.coverageScore < beforeResult.coverageScore) {
      worsened.push(change);
    }
  }

  // 점수 차이 내림차순 정렬
  gained.sort((a, b) => (b.afterScore - b.beforeScore) - (a.afterScore - a.beforeScore));
  lost.sort((a, b) => (a.afterScore - a.beforeScore) - (b.afterScore - b.beforeScore));
  improved.sort((a, b) => (b.afterScore - b.beforeScore) - (a.afterScore - a.beforeScore));
  worsened.sort((a, b) => (a.afterScore - a.beforeScore) - (b.afterScore - b.beforeScore));

  const beforeAvg = calcAvg(beforeFlat);
  const afterAvg = calcAvg(afterFlat);

  return {
    before,
    after,
    gained,
    lost,
    improved,
    worsened,
    netChange: gained.length - lost.length,
    avgScoreDiff: parseFloat((afterAvg - beforeAvg).toFixed(2)),
  };
}
