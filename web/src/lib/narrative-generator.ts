// 학과 적합성 스토리 생성
// 이수 과목 + 목표 전공 조합으로 학생부/면접용 내러티브 초안 자동 생성
// AI API 호출 없이 순수 규칙 기반 템플릿 조합

import { CourseRecommendationData } from "./types";
import { getCourseRecommendation } from "./course-utils";
import { categorizeSubject, classifyCourseLevel, normalizeSubject } from "./subject";

// ── 입출력 인터페이스 ──

export interface NarrativeInput {
  university: string;
  department: string;
  currentCourses: string[];
}

export interface NarrativeResult {
  summary: string;           // 1문장 요약
  strengthPoints: string[];  // 강점 (이수한 핵심과목 기반)
  growthPoints: string[];    // 성장 포인트 (진로선택 과목 기반)
  connectionStory: string;   // 과목→전공 연결 스토리 (2-3문장)
  interviewTip: string;      // 면접 활용 팁
  matchedCoreCount: number;
  totalCoreCount: number;
}

// ── 카테고리 → 역량 키워드 매핑 ──

const CATEGORY_KEYWORD: Record<string, string> = {
  수학: "논리적 분석력과 수리적 사고 역량",
  과학: "과학적 탐구력과 실험 설계 역량",
  사회: "사회 현상에 대한 비판적 분석 역량",
  언어: "텍스트 분석과 커뮤니케이션 역량",
  정보: "디지털 기술 활용과 컴퓨팅 사고력",
  기타: "다학문적 탐구 역량",
};

// ── 과목 레벨 → 의미 키워드 매핑 ──

const LEVEL_MEANING: Record<string, string> = {
  진로선택: "심화 탐구 의지",
  융합선택: "융합적 사고와 다학제적 접근",
  일반선택: "기초 학문 역량",
};

// ── 카테고리별 대표 핵심개념 키워드 (면접 팁용) ──

const CATEGORY_CONCEPT: Record<string, string> = {
  수학: "수리적 모델링과 논리적 추론",
  과학: "가설 설정과 탐구 방법론",
  사회: "사회 구조 분석과 비판적 사고",
  언어: "정보 분석과 논리적 표현",
  정보: "알고리즘 설계와 데이터 처리",
  기타: "융합적 문제 해결",
};

// ── 적합도 등급 판정 ──

function getMatchLevel(matched: number, total: number): string {
  if (total === 0) return "낮음";
  const ratio = matched / total;
  if (ratio >= 0.7) return "높음";
  if (ratio >= 0.4) return "보통";
  return "낮음";
}

// ── 가장 많이 매칭된 카테고리 찾기 ──

function getDominantCategory(subjects: string[]): string {
  const counts: Record<string, number> = {};
  for (const s of subjects) {
    const cat = categorizeSubject(s);
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  let max = 0;
  let dominant = "기타";
  for (const [cat, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = cat;
    }
  }
  return dominant;
}

// ── 학과 적합성 내러티브 생성 ──

export function generateNarrative(
  data: CourseRecommendationData,
  input: NarrativeInput
): NarrativeResult | null {
  const { university, department, currentCourses } = input;

  // 1. 목표 학과 권장과목 조회
  const recommendation = getCourseRecommendation(data, university, department);
  if (!recommendation) return null;

  const { core: coreSubjects, recommended: recSubjects } = recommendation;

  // 2. 학생 이수 과목 정규화
  const normalizedCurrentCourses = currentCourses.map(normalizeSubject);

  // 3. 핵심권장과목 매칭 판별
  const matchedCore = coreSubjects.filter((s) =>
    normalizedCurrentCourses.includes(s)
  );
  const missingCore = coreSubjects.filter(
    (s) => !normalizedCurrentCourses.includes(s)
  );

  // 4. 권장과목(비핵심) 매칭 판별
  const matchedRec = recSubjects.filter((s) =>
    normalizedCurrentCourses.includes(s)
  );

  const matchedCoreCount = matchedCore.length;
  const totalCoreCount = coreSubjects.length;

  // ── strengthPoints: 이수한 핵심과목 기반 강점 문장 생성 ──

  const strengthPoints: string[] = matchedCore.map((subject) => {
    const category = categorizeSubject(subject);
    const keyword = CATEGORY_KEYWORD[category] ?? CATEGORY_KEYWORD["기타"];
    const level = classifyCourseLevel(subject);

    // 진로선택 과목은 전공 관심과 심화 탐구 의지 강조
    if (level === "진로선택") {
      return `${subject}(진로선택) 이수는 ${department}에 대한 깊은 관심과 심화 탐구 의지를 보여줍니다.`;
    }

    return `${subject} 이수를 통해 ${keyword}을 갖추었습니다.`;
  });

  // ── growthPoints: 이수한 권장과목(비핵심) 기반 성장 포인트 생성 ──

  const growthPoints: string[] = matchedRec.map((subject) => {
    const category = categorizeSubject(subject);
    const keyword = CATEGORY_KEYWORD[category] ?? CATEGORY_KEYWORD["기타"];
    return `${subject} 이수로 ${keyword}을 확장하였습니다.`;
  });

  // ── connectionStory: 과목→전공 연결 스토리 (2-3문장) ──

  const storyParts: string[] = [];

  // 문장 1: 핵심과목 이수 카테고리 → 전공 기초 연결
  if (matchedCore.length > 0) {
    // 매칭된 핵심과목의 카테고리 목록 (중복 제거)
    const coreCategories = [
      ...new Set(matchedCore.map((s) => categorizeSubject(s))),
    ];
    const categoryLabel = coreCategories.join(", ");
    storyParts.push(
      `${categoryLabel} 분야의 핵심 과목을 이수하여 ${department} 전공 기초를 탄탄히 다졌습니다.`
    );
  } else {
    // 핵심과목 매칭이 전혀 없는 경우
    storyParts.push(
      `현재 이수 과목을 바탕으로 ${department} 전공에 필요한 기초 역량을 쌓아가고 있습니다.`
    );
  }

  // 문장 2 (조건부): 진로선택 과목이 있는 경우 탐구 자세 강조
  const careerChoiceCourses = matchedCore.filter(
    (s) => classifyCourseLevel(s) === "진로선택"
  );
  // 권장과목 중 진로선택도 포함
  const careerChoiceRec = matchedRec.filter(
    (s) => classifyCourseLevel(s) === "진로선택"
  );
  const allCareerCourses = [...careerChoiceCourses, ...careerChoiceRec];

  if (allCareerCourses.length > 0) {
    const courseList = allCareerCourses.join(", ");
    storyParts.push(
      `특히 ${courseList}을 선택하여 전공 분야에 대한 적극적인 탐구 자세를 보여주었습니다.`
    );
  }

  // 문장 3 (조건부): 미이수 핵심과목이 있는 경우 보완 계획 언급
  if (missingCore.length > 0) {
    const missingList = missingCore.join(", ");
    storyParts.push(
      `${missingList}은 향후 대학 전공 학습에서 보완해 나갈 계획입니다.`
    );
  }

  const connectionStory = storyParts.join(" ");

  // ── interviewTip: 가장 강한 매칭 카테고리 기반 면접 팁 ──

  // 핵심과목 → 권장과목 순으로 우선순위 부여
  const allMatchedSubjects = [...matchedCore, ...matchedRec];
  const dominantCategory = getDominantCategory(allMatchedSubjects);
  const dominantKeyword = CATEGORY_KEYWORD[dominantCategory] ?? CATEGORY_KEYWORD["기타"];
  const dominantConcept = CATEGORY_CONCEPT[dominantCategory] ?? CATEGORY_CONCEPT["기타"];

  // 대표 과목: 해당 카테고리에서 첫 번째 매칭 과목
  const representativeSubject =
    allMatchedSubjects.find(
      (s) => categorizeSubject(s) === dominantCategory
    ) ?? (allMatchedSubjects[0] ?? coreSubjects[0] ?? "");

  const interviewTip =
    `면접에서 ${dominantCategory} 관련 과목의 학습 경험을 ${department} 전공과 연결 지어 설명하면 효과적입니다. ` +
    `예를 들어, ${representativeSubject}에서 배운 ${dominantConcept}가 ${department} 분야에서 어떻게 활용되는지 구체적으로 말씀하세요.`;

  // ── summary: 1문장 요약 ──

  const matchLevel = getMatchLevel(matchedCoreCount, totalCoreCount);

  // 강점 카테고리: 핵심과목 기준으로 판별
  const summaryCategory =
    matchedCore.length > 0
      ? getDominantCategory(matchedCore)
      : allMatchedSubjects.length > 0
      ? getDominantCategory(allMatchedSubjects)
      : "전반";

  const summary =
    `${university} ${department}에 대한 교과 적합도가 ${matchLevel}이며, ` +
    `${matchedCoreCount}/${totalCoreCount}개 핵심권장과목을 이수하여 ${summaryCategory} 분야의 학업 역량이 돋보입니다.`;

  return {
    summary,
    strengthPoints,
    growthPoints,
    connectionStory,
    interviewTip,
    matchedCoreCount,
    totalCoreCount,
  };
}
