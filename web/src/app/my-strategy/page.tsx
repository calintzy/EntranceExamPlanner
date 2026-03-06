import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getUniversityList, getAllSubjects } from "@/lib/course-utils";
import StrategyClient from "./strategy-client";
import { BRAND_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `맞춤 과목 전략 - 내 교과 적합도 분석 | ${BRAND_NAME}`,
  description:
    "목표 대학·학과와 현재 수강 과목을 입력하면, 핵심권장과목 이수 현황과 적합도 점수를 분석해드립니다. 미이수 과목 경고와 추천까지.",
  openGraph: {
    title: `맞춤 과목 전략 - 내 교과 적합도 분석 | ${BRAND_NAME}`,
    description:
      "목표 대학에 맞는 교과 선택 전략을 확인하세요.",
  },
};

// 빌드 타임 데이터 준비
const universities = getUniversityList(courseData);
const departmentMap: Record<string, string[]> = {};
for (const uni of universities) {
  departmentMap[uni] = Object.keys(courseData[uni] || {});
}
const allSubjects = getAllSubjects(courseData);

export default function MyStrategyPage() {
  return (
    <StrategyClient
      courseData={courseData}
      universities={universities}
      departmentMap={departmentMap}
      allSubjects={allSubjects}
    />
  );
}
