// 49개 대학 학과별 권장과목 데이터
// 출처:
//   - 2026학년도 (6개 대학): 각 대학 입학처 모집요강 및 전공연계 교과이수 안내자료
//   - 2028학년도 (43개 대학): adiga.kr 대입정보포털 "2028학년도 권역별 대학별 권장과목" 자료집
// 최종 수정일: 2026-03-04

import { CourseRecommendationData } from "./types";
import { categorizeSubject } from "./subject";
import {
  getDepartments as _getDepartments,
  getCourseRecommendation as _getCourseRecommendation,
  compareUniversities as _compareUniversities,
} from "./course-utils";

import combinedData from "./combined_recommendations.json";

export const courseData: CourseRecommendationData = combinedData;

// === 하위 호환 API (guide/page.tsx에서 사용 중) ===

export const universities = Object.keys(courseData);

export function getDepartments(university: string): string[] {
  return _getDepartments(courseData, university);
}

export function getCourseRecommendation(
  university: string,
  department: string
) {
  return _getCourseRecommendation(courseData, university, department);
}

export function compareUniversities(department: string) {
  return _compareUniversities(courseData, department);
}

// categorizeSubject는 subject.ts에서 직접 re-export
export { categorizeSubject } from "./subject";
