// 빌드 타임 데이터 로딩 (Server Component / generateStaticParams 전용)
// 이 파일은 Node.js 환경(빌드 시)에서만 import해야 합니다
// "use client" 컴포넌트에서는 직접 import하지 마세요

import fs from "fs";
import path from "path";
import { CourseRecommendationData, DepartmentCourses } from "./types";

// JSON 데이터 경로 (web/ 기준으로 ../data/)
const DATA_DIR = path.join(process.cwd(), "..", "data", "course-guide");
const RECOMMENDATIONS_PATH = path.join(DATA_DIR, "raw_recommendations.json");

// JSON 값 클린업: 공백 전용 → 빈 문자열, 끝 쉼표/또는 제거
function cleanValue(value: string): string {
  if (!value || !value.trim()) return "";
  return value.trim().replace(/[,\s]+$/, "").replace(/\s*또는\s*$/, "").trim();
}

// 캐시: 빌드 시 한 번만 로드
let cachedData: CourseRecommendationData | null = null;

// JSON에서 권장과목 데이터 로드 + 클린업
export function loadCourseData(): CourseRecommendationData {
  if (cachedData) return cachedData;

  const raw = fs.readFileSync(RECOMMENDATIONS_PATH, "utf-8");
  const data = JSON.parse(raw) as Record<
    string,
    Record<string, DepartmentCourses>
  >;

  // 데이터 클린업
  const cleaned: CourseRecommendationData = {};
  for (const [univ, depts] of Object.entries(data)) {
    cleaned[univ] = {};
    for (const [dept, courses] of Object.entries(depts)) {
      cleaned[univ][dept] = {
        core: cleanValue(courses.core),
        recommended: cleanValue(courses.recommended),
      };
    }
  }

  cachedData = cleaned;
  return cleaned;
}

// 전체 과목 목록 추출 (sitemap, 역방향 검색 인덱스 등)
export function getAllSubjects(): string[] {
  const data = loadCourseData();
  const subjects = new Set<string>();

  for (const depts of Object.values(data)) {
    for (const courses of Object.values(depts)) {
      const allRaw = `${courses.core}, ${courses.recommended}`;
      allRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          // "또는"으로 분리된 과목도 개별 추가
          if (s.includes("또는")) {
            s.split("또는")
              .map((x) => x.trim())
              .filter(Boolean)
              .forEach((x) => subjects.add(x));
          } else {
            subjects.add(s);
          }
        });
    }
  }

  return Array.from(subjects).sort();
}
