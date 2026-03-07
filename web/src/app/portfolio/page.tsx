import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getUniversityList, getAllSubjects } from "@/lib/course-utils";
import PortfolioClient from "./portfolio-client";
import { BRAND_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `전략 포트폴리오 - 최적 과목 조합 추천 | ${BRAND_NAME}`,
  description:
    "목표 대학 5~10개를 동시에 고려하여, 가장 효과적인 과목 조합을 추천해드립니다. 과목 하나만 추가해도 적합도가 크게 오르는 핵심 과목을 찾아보세요.",
  openGraph: {
    title: `전략 포트폴리오 - 최적 과목 조합 추천 | ${BRAND_NAME}`,
    description: "여러 목표 대학을 동시에 고려한 최적 과목 조합을 찾아보세요.",
  },
};

// 빌드 타임 데이터 준비
const universities = getUniversityList(courseData);
const departmentMap: Record<string, string[]> = {};
for (const uni of universities) {
  departmentMap[uni] = Object.keys(courseData[uni] || {});
}
const allSubjects = getAllSubjects(courseData);

export default function PortfolioPage() {
  return (
    <PortfolioClient
      courseData={courseData}
      universities={universities}
      departmentMap={departmentMap}
      allSubjects={allSubjects}
    />
  );
}
