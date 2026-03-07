import type { Metadata } from "next";
import { Suspense } from "react";
import { courseData } from "@/lib/course-data";
import { getAllSubjects } from "@/lib/course-utils";
import CompareClient from "./compare-client";
import { BRAND_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `친구와 비교하기 - 과목 선택 비교 분석 | ${BRAND_NAME}`,
  description:
    "내 과목 선택과 친구의 과목 선택을 비교하여, 각자 유리한 대학/학과를 확인하세요. URL 공유로 간편하게 비교할 수 있습니다.",
  openGraph: {
    title: `친구와 비교하기 - 과목 선택 비교 분석 | ${BRAND_NAME}`,
    description: "과목 선택을 비교하여 각자 유리한 대학을 찾아보세요.",
  },
};

const allSubjects = getAllSubjects(courseData);

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CompareClient
        courseData={courseData}
        allSubjects={allSubjects}
      />
    </Suspense>
  );
}
