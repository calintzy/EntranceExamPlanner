import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import GuideClient from "./guide-client";

export const metadata: Metadata = {
  title: "교과 선택 가이드 - 대학별 권장과목 조회 및 비교 | 입시플래너",
  description:
    "서울대, 연세대, 고려대 등 주요 대학의 학과별 권장과목을 조회하고 대학간 비교하세요. 2028 고교학점제 대비 교과 선택 가이드.",
  openGraph: {
    title: "교과 선택 가이드 - 대학별 권장과목 조회 및 비교",
    description:
      "서울대, 연세대, 고려대 등 주요 대학의 학과별 권장과목을 조회하고 대학간 비교하세요.",
  },
};

// Server Component: 데이터를 로드하여 Client Component에 전달
// 현재는 하드코딩 데이터 사용, 추후 data-loader.ts로 전환 예정
export default function GuidePage() {
  return <GuideClient courseData={courseData} />;
}
