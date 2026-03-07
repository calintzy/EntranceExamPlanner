// 친구와 비교하기
// 두 학생의 과목 리스트 로드맵 비교 → 바이럴 성장

import { CourseRecommendationData } from "./types";
import { analyzeRoadmap, type RoadmapSummary, type RoadmapResult } from "./roadmap-analyzer";
import { normalizeSubject } from "./subject";
import { type ScoreGrade } from "./gap-analysis";

// ── 출력 인터페이스 ──

export interface DeptAdvantage {
  university: string;
  department: string;
  myScore: number;
  friendScore: number;
  myGrade: ScoreGrade;
  friendGrade: ScoreGrade;
}

export interface CompareResult {
  onlyMine: string[];         // 나만 이수한 과목
  onlyFriend: string[];       // 친구만 이수한 과목
  common: string[];           // 공통 이수 과목
  myRoadmap: RoadmapSummary;
  friendRoadmap: RoadmapSummary;
  myAdvantage: DeptAdvantage[];      // 내가 더 높은 학과
  friendAdvantage: DeptAdvantage[];  // 친구가 더 높은 학과
  tie: DeptAdvantage[];              // 동점 학과 (상위만)
  myAvgScore: number;
  friendAvgScore: number;
}

// ── 플랫 배열 변환 ──
function flattenResults(summary: RoadmapSummary): RoadmapResult[] {
  return [
    ...summary.excellent,
    ...summary.good,
    ...summary.warning,
    ...summary.danger,
  ];
}

// ── 평균 점수 ──
function calcAvg(results: RoadmapResult[]): number {
  if (results.length === 0) return 0;
  return parseFloat(
    (results.reduce((sum, r) => sum + r.coverageScore, 0) / results.length).toFixed(1)
  );
}

// ── 프로필 비교 ──

export function compareProfiles(
  data: CourseRecommendationData,
  myCourses: string[],
  friendCourses: string[]
): CompareResult {
  // 과목 정규화
  const myNormalized = new Set(myCourses.map(normalizeSubject));
  const friendNormalized = new Set(friendCourses.map(normalizeSubject));

  // 공통 / 차이 과목 분류
  const common: string[] = [];
  const onlyMine: string[] = [];
  const onlyFriend: string[] = [];

  for (const s of myNormalized) {
    if (friendNormalized.has(s)) common.push(s);
    else onlyMine.push(s);
  }
  for (const s of friendNormalized) {
    if (!myNormalized.has(s)) onlyFriend.push(s);
  }

  // 로드맵 분석
  const myRoadmap = analyzeRoadmap(data, myCourses);
  const friendRoadmap = analyzeRoadmap(data, friendCourses);

  // 플랫 비교
  const myFlat = flattenResults(myRoadmap);
  const friendFlat = flattenResults(friendRoadmap);

  const friendMap = new Map<string, RoadmapResult>();
  for (const r of friendFlat) {
    friendMap.set(`${r.university}|${r.department}`, r);
  }

  const myAdvantage: DeptAdvantage[] = [];
  const friendAdvantage: DeptAdvantage[] = [];
  const tie: DeptAdvantage[] = [];

  for (const myResult of myFlat) {
    const key = `${myResult.university}|${myResult.department}`;
    const friendResult = friendMap.get(key);
    if (!friendResult) continue;

    const entry: DeptAdvantage = {
      university: myResult.university,
      department: myResult.department,
      myScore: myResult.coverageScore,
      friendScore: friendResult.coverageScore,
      myGrade: myResult.grade,
      friendGrade: friendResult.grade,
    };

    if (myResult.coverageScore > friendResult.coverageScore) {
      myAdvantage.push(entry);
    } else if (friendResult.coverageScore > myResult.coverageScore) {
      friendAdvantage.push(entry);
    } else if (myResult.coverageScore >= 60) {
      // 동점이면서 도전권 이상만 표시
      tie.push(entry);
    }
  }

  // 점수 차이 내림차순
  myAdvantage.sort((a, b) => (b.myScore - b.friendScore) - (a.myScore - a.friendScore));
  friendAdvantage.sort((a, b) => (b.friendScore - b.myScore) - (a.friendScore - a.myScore));
  tie.sort((a, b) => b.myScore - a.myScore);

  return {
    onlyMine,
    onlyFriend,
    common,
    myRoadmap,
    friendRoadmap,
    myAdvantage,
    friendAdvantage,
    tie,
    myAvgScore: calcAvg(myFlat),
    friendAvgScore: calcAvg(friendFlat),
  };
}
