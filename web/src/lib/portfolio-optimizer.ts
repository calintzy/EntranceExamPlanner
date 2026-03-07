// 전략 과목 포트폴리오 최적화
// 목표 5~10개 학과를 동시 고려하여 최적 과목 조합 추천

import { CourseRecommendationData } from "./types";
import { analyzeGap, type GapAnalysisResult } from "./gap-analysis";
import { normalizeSubject, categorizeSubject } from "./subject";

// ── 입력 인터페이스 ──

export interface PortfolioInput {
  targets: { university: string; department: string }[];
  currentCourses: string[];
}

// ── 과목별 영향도 ──

export interface SubjectImpact {
  subject: string;
  category: string;
  impactScore: number;       // 추가 시 전체 평균 점수 상승폭
  affectedTargets: number;   // 영향받는 목표 수
  targetDetails: {
    university: string;
    department: string;
    type: "core" | "recommended";
  }[];
}

// ── 포트폴리오 분석 결과 ──

export interface PortfolioResult {
  currentAvgScore: number;
  targetScores: GapAnalysisResult[];
  recommendations: SubjectImpact[];  // impactScore 내림차순
  commonCore: string[];              // 80%+ 목표가 요구하는 공통 핵심과목
  leverageSubjects: string[];        // 가성비 과목 (3개+ 학과에 동시 영향)
}

// ── 현재 과목 기준 갭 분석 실행 헬퍼 ──

function runGapAnalysis(
  data: CourseRecommendationData,
  targets: { university: string; department: string }[],
  courses: string[]
): GapAnalysisResult[] {
  return analyzeGap(data, {
    targetUniversities: targets,
    currentCourses: courses,
  });
}

// ── 평균 적합도 점수 계산 ──

function calcAvgScore(results: GapAnalysisResult[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.coverageScore, 0);
  return total / results.length;
}

// ── 누락 과목 유니온 수집 ──
// 모든 목표 학과의 missingCore + missingRec를 합산하여 후보 과목 집합 생성

function collectMissingSubjects(results: GapAnalysisResult[]): Set<string> {
  const missing = new Set<string>();
  for (const r of results) {
    for (const s of r.missingCore) missing.add(s);
    for (const s of r.missingRec) missing.add(s);
  }
  return missing;
}

// ── 포트폴리오 최적화 메인 함수 ──

export function optimizePortfolio(
  data: CourseRecommendationData,
  input: PortfolioInput
): PortfolioResult {
  const { targets, currentCourses } = input;

  // 1단계: 현재 과목 기준 갭 분석
  const baseResults = runGapAnalysis(data, targets, currentCourses);
  const currentAvgScore = calcAvgScore(baseResults);

  // 타겟이 없거나 데이터가 없는 경우 빈 결과 반환
  if (targets.length === 0) {
    return {
      currentAvgScore: 0,
      targetScores: [],
      recommendations: [],
      commonCore: [],
      leverageSubjects: [],
    };
  }

  // 2단계: 모든 누락 과목 수집 (시뮬레이션 후보)
  const missingSubjects = collectMissingSubjects(baseResults);

  // 3단계: 각 누락 과목을 추가했을 때의 영향도 시뮬레이션
  const impacts: SubjectImpact[] = [];

  for (const subject of missingSubjects) {
    // 현재 과목에 후보 과목 1개 추가하여 시뮬레이션
    const simulatedCourses = [...currentCourses, subject];
    const simulatedResults = runGapAnalysis(data, targets, simulatedCourses);
    const newAvgScore = calcAvgScore(simulatedResults);

    // 점수 상승폭 계산
    const impactScore = parseFloat((newAvgScore - currentAvgScore).toFixed(2));

    // 어떤 목표 학과에 영향을 주는지 추적
    const targetDetails: SubjectImpact["targetDetails"] = [];

    for (let i = 0; i < baseResults.length; i++) {
      const base = baseResults[i];
      const simulated = simulatedResults[i];

      // 이 과목 추가로 점수가 오른 목표만 기록
      if (simulated.coverageScore > base.coverageScore) {
        // 핵심과목인지 권장과목인지 판별
        const normalizedSubject = normalizeSubject(subject);
        const wasInMissingCore = base.missingCore.includes(normalizedSubject);
        const type: "core" | "recommended" = wasInMissingCore ? "core" : "recommended";

        targetDetails.push({
          university: base.university,
          department: base.department,
          type,
        });
      }
    }

    impacts.push({
      subject,
      category: categorizeSubject(subject),
      impactScore,
      affectedTargets: targetDetails.length,
      targetDetails,
    });
  }

  // 4단계: impactScore 내림차순 정렬 (동점 시 affectedTargets 내림차순)
  impacts.sort((a, b) => {
    if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
    return b.affectedTargets - a.affectedTargets;
  });

  // 5단계: 공통 핵심과목 추출
  // 전체 목표의 80% 이상이 missingCore로 요구하는 과목
  const threshold = Math.ceil(targets.length * 0.8);
  const coreFrequency = new Map<string, number>();

  for (const result of baseResults) {
    for (const subject of result.missingCore) {
      coreFrequency.set(subject, (coreFrequency.get(subject) ?? 0) + 1);
    }
  }

  const commonCore = Array.from(coreFrequency.entries())
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])  // 빈도 내림차순
    .map(([subject]) => subject);

  // 6단계: 가성비 과목 추출 (3개+ 학과에 동시 영향)
  const leverageSubjects = impacts
    .filter((impact) => impact.affectedTargets >= 3)
    .map((impact) => impact.subject);

  return {
    currentAvgScore: parseFloat(currentAvgScore.toFixed(2)),
    targetScores: baseResults,
    recommendations: impacts,
    commonCore,
    leverageSubjects,
  };
}
