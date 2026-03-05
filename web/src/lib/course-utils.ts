// 순수 도메인 함수들 (데이터를 인자로 받아 동작)
// Server Component / Client Component 양쪽에서 사용 가능

import { CourseRecommendationData } from "./types";
import { parseSubjects, normalizeSubject } from "./subject";
import universityMeta from "./university_meta.json";

// ── 대학 메타 데이터 타입 및 헬퍼 (GAP 5, 6 해결) ──
export interface UniversityMeta {
  year: number;
  source: string;
  region?: string;
  location?: string;
  curriculum?: "2015개정" | "2022개정";
  regularAdmission?: {
    courseEvalRatio?: number | null;
    description?: string;
  };
}

const meta = universityMeta as Record<string, UniversityMeta>;

export function getUniversityMeta(university: string): UniversityMeta | null {
  return meta[university] ?? null;
}

export function getUniversityYear(university: string): number {
  return meta[university]?.year ?? 2026;
}

export function getDataLabel(university: string): string {
  const year = getUniversityYear(university);
  return `${year}학년도`;
}

// 대학 목록 조회
export function getUniversityList(data: CourseRecommendationData): string[] {
  return Object.keys(data);
}

// 대학별 학과 목록 조회
export function getDepartments(
  data: CourseRecommendationData,
  university: string
): string[] {
  return Object.keys(data[university] || {});
}

// 학과별 권장과목 조회 (정규화된 과목 배열 반환)
export function getCourseRecommendation(
  data: CourseRecommendationData,
  university: string,
  department: string
): { core: string[]; recommended: string[] } | null {
  const dept = data[university]?.[department];
  if (!dept) return null;

  return {
    core: parseSubjects(dept.core),
    recommended: parseSubjects(dept.recommended),
  };
}

// 여러 대학 동시 비교 (학과명 유사 매칭 개선)
export function compareUniversities(
  data: CourseRecommendationData,
  department: string
): { university: string; matchedDept: string; core: string[]; recommended: string[] }[] {
  const results: {
    university: string;
    matchedDept: string;
    core: string[];
    recommended: string[];
  }[] = [];

  // 검색 키워드: 학과/학부/전공 등 접미사 제거
  const keyword = department.replace(/학과|학부|전공|계열|대학/g, "").trim();
  if (!keyword) return results;

  for (const univ of Object.keys(data)) {
    const depts = Object.keys(data[univ]);

    // 개선된 매칭: 정확한 이름 → 키워드 포함 순으로 검색
    // "공학"같은 짧은 키워드 오탐 방지: 키워드가 2글자 이하이면 정확 매칭만
    const matches = keyword.length <= 2
      ? depts.filter((d) => d === department)
      : depts.filter(
          (d) =>
            d === department ||
            d.includes(keyword) ||
            keyword.includes(d.replace(/학과|학부|전공|계열/g, ""))
        );

    // 모든 매칭된 학과 포함 (Array.find 대신 filter 사용 — 누락 방지)
    for (const match of matches) {
      const rec = getCourseRecommendation(data, univ, match);
      if (rec) {
        results.push({
          university: univ,
          matchedDept: match,
          ...rec,
        });
      }
    }
  }

  return results;
}

// 역방향 검색: 과목 → 해당 과목을 권장하는 대학/학과 목록
export function searchBySubject(
  data: CourseRecommendationData,
  subjectName: string
): { university: string; department: string; type: "core" | "recommended" }[] {
  const normalized = normalizeSubject(subjectName);
  const results: {
    university: string;
    department: string;
    type: "core" | "recommended";
  }[] = [];

  for (const [univ, depts] of Object.entries(data)) {
    for (const [dept, courses] of Object.entries(depts)) {
      const coreSubjects = parseSubjects(courses.core);
      const recSubjects = parseSubjects(courses.recommended);

      if (coreSubjects.includes(normalized)) {
        results.push({ university: univ, department: dept, type: "core" });
      } else if (recSubjects.includes(normalized)) {
        results.push({
          university: univ,
          department: dept,
          type: "recommended",
        });
      }
    }
  }

  return results;
}

// 전체 고유 과목 목록 추출 (정규화 적용, 정렬)
// generateStaticParams() 및 검색 UI에서 사용
export function getAllSubjects(data: CourseRecommendationData): string[] {
  const subjects = new Set<string>();

  for (const depts of Object.values(data)) {
    for (const courses of Object.values(depts)) {
      for (const s of parseSubjects(courses.core)) subjects.add(s);
      for (const s of parseSubjects(courses.recommended)) subjects.add(s);
    }
  }

  return Array.from(subjects).sort();
}
