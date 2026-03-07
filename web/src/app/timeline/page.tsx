import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getUniversityList, getAllSubjects } from "@/lib/course-utils";
import TimelineClient from "./timeline-client";
import { BRAND_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `학년별 이수 타임라인 - 최적 과목 배치 | ${BRAND_NAME}`,
  description:
    "목표 대학/학과를 선택하면 고1→고2→고3 최적 과목 이수 순서를 제안합니다. 선수과목 관계와 과목 레벨을 고려한 학년별 타임라인.",
  openGraph: {
    title: `학년별 이수 타임라인 - 최적 과목 배치 | ${BRAND_NAME}`,
    description: "목표 대학에 맞는 학년별 과목 이수 순서를 확인하세요.",
  },
};

const universities = getUniversityList(courseData);
const departmentMap: Record<string, string[]> = {};
for (const uni of universities) {
  departmentMap[uni] = Object.keys(courseData[uni] || {});
}

export default function TimelinePage() {
  return (
    <TimelineClient
      courseData={courseData}
      universities={universities}
      departmentMap={departmentMap}
    />
  );
}
