import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getAllSubjects } from "@/lib/course-utils";
import SynergyClient from "./synergy-client";
import { BRAND_NAME } from "@/lib/site-config";
import { buildSynergyData } from "@/lib/synergy-analyzer";

export const metadata: Metadata = {
  title: `과목 시너지 맵 - 동시 추천 과목 분석 | ${BRAND_NAME}`,
  description:
    "어떤 과목이 함께 추천되는지 시너지 관계를 분석합니다. 과목 간 동시 추천 빈도로 최적의 과목 조합을 찾아보세요.",
  openGraph: {
    title: `과목 시너지 맵 - 동시 추천 과목 분석 | ${BRAND_NAME}`,
    description: "과목 간 시너지 관계를 분석하여 최적 조합을 찾아보세요.",
  },
};

// 빌드 타임에 시너지 데이터 사전 계산
const synergyData = buildSynergyData(courseData);
const allSubjects = getAllSubjects(courseData);

export default function SynergyPage() {
  return (
    <SynergyClient
      synergyData={synergyData}
      allSubjects={allSubjects}
    />
  );
}
