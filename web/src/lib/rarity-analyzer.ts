// 과목 조합 희소성 분석
// 특정 학과군 지원자 관점에서, 학생의 과목 중 희소한 과목을 발견

import { CourseRecommendationData } from "./types";
import { parseSubjects, normalizeSubject, categorizeSubject } from "./subject";

// ── 출력 인터페이스 ──

export interface SubjectRarity {
  subject: string;
  category: string;
  mentionRate: number;    // 해당 학과군에서 이 과목 추천 비율 (0~100%)
  isRare: boolean;        // mentionRate < 20%
  positioningTip: string; // 포지셔닝 전략 문장
}

export interface RarityResult {
  keyword: string;
  matchedDepts: number;
  rareSubjects: SubjectRarity[];
  commonSubjects: SubjectRarity[];
  uniquenessScore: number; // 조합 전체의 희소성 점수 (0~100)
}

// ── 카테고리별 포지셔닝 키워드 ──

const POSITIONING_TIPS: Record<string, string> = {
  수학: "수리적 사고력과 정량적 분석 능력을 차별화 포인트로 활용하세요",
  과학: "과학적 탐구 역량과 실험 설계 경험을 어필하세요",
  사회: "사회 현상에 대한 통찰력과 비판적 사고를 강조하세요",
  언어: "텍스트 분석과 논리적 표현 능력을 부각하세요",
  정보: "디지털 역량과 데이터 활용 능력을 강점으로 제시하세요",
  기타: "다학문적 관점과 융합적 사고를 어필하세요",
};

// ── 희소성 분석 ──

export function analyzeRarity(
  data: CourseRecommendationData,
  currentCourses: string[],
  targetKeyword: string
): RarityResult {
  const normalizedCurrent = currentCourses.map(normalizeSubject);

  // 1. 키워드로 관련 학과 필터링
  const keyword = targetKeyword.replace(/학과|학부|전공|계열|대학/g, "").trim();
  const matchedDepts: { university: string; department: string; subjects: string[] }[] = [];

  for (const [uni, depts] of Object.entries(data)) {
    for (const [dept, courses] of Object.entries(depts)) {
      if (keyword.length <= 1) continue; // 너무 짧은 키워드 무시
      if (dept.includes(keyword) || keyword.includes(dept.replace(/학과|학부|전공|계열/g, ""))) {
        const allSubjects = [
          ...parseSubjects(courses.core),
          ...parseSubjects(courses.recommended),
        ];
        matchedDepts.push({ university: uni, department: dept, subjects: allSubjects });
      }
    }
  }

  if (matchedDepts.length === 0) {
    return {
      keyword: targetKeyword,
      matchedDepts: 0,
      rareSubjects: [],
      commonSubjects: [],
      uniquenessScore: 0,
    };
  }

  // 2. 해당 학과군 전체에서 각 과목의 출현 빈도 계산
  const subjectFreq = new Map<string, number>();
  for (const dept of matchedDepts) {
    const seen = new Set<string>(); // 학과 내 중복 방지
    for (const s of dept.subjects) {
      if (!seen.has(s)) {
        seen.add(s);
        subjectFreq.set(s, (subjectFreq.get(s) ?? 0) + 1);
      }
    }
  }

  // 3. 학생 과목 중 해당 학과군에서의 출현율 계산
  const totalDepts = matchedDepts.length;
  const rareSubjects: SubjectRarity[] = [];
  const commonSubjects: SubjectRarity[] = [];

  for (const subject of normalizedCurrent) {
    const freq = subjectFreq.get(subject) ?? 0;
    const mentionRate = parseFloat(((freq / totalDepts) * 100).toFixed(1));
    const isRare = mentionRate < 20;
    const category = categorizeSubject(subject);
    const tip = POSITIONING_TIPS[category] ?? POSITIONING_TIPS["기타"];

    const entry: SubjectRarity = {
      subject,
      category,
      mentionRate,
      isRare,
      positioningTip: isRare
        ? `${targetKeyword} 계열에서 ${subject} 이수자는 상위 ${Math.max(mentionRate, 1).toFixed(0)}%. ${tip}.`
        : `${targetKeyword} 계열에서 보편적으로 추천되는 과목입니다.`,
    };

    if (isRare) {
      rareSubjects.push(entry);
    } else {
      commonSubjects.push(entry);
    }
  }

  // 희소성 순 정렬 (낮은 mentionRate가 먼저)
  rareSubjects.sort((a, b) => a.mentionRate - b.mentionRate);
  commonSubjects.sort((a, b) => a.mentionRate - b.mentionRate);

  // 4. 조합 전체 희소성 점수 계산
  // 희소 과목이 많을수록 높은 점수 (0~100)
  const totalStudentSubjects = normalizedCurrent.length;
  const rareRatio = totalStudentSubjects > 0 ? rareSubjects.length / totalStudentSubjects : 0;
  // 평균 mentionRate의 역수 가중
  const avgMentionRate =
    normalizedCurrent.length > 0
      ? normalizedCurrent.reduce((sum, s) => {
          const freq = subjectFreq.get(s) ?? 0;
          return sum + (freq / totalDepts) * 100;
        }, 0) / normalizedCurrent.length
      : 100;

  const uniquenessScore = Math.round(
    Math.min(100, rareRatio * 60 + (100 - avgMentionRate) * 0.4)
  );

  return {
    keyword: targetKeyword,
    matchedDepts: totalDepts,
    rareSubjects,
    commonSubjects,
    uniquenessScore,
  };
}
