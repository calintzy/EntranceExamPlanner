import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getAllSubjects } from "@/lib/course-utils";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "역방향 검색 - 내 과목으로 유리한 대학 찾기 | 입시플래너",
  description:
    "내가 선택한 과목을 핵심권장 또는 권장하는 대학과 학과를 찾아보세요. 미적분, 물리학Ⅱ, 화학Ⅱ 등 과목별 대학 검색.",
  openGraph: {
    title: "역방향 검색 - 내 과목으로 유리한 대학 찾기",
    description:
      "내가 선택한 과목을 권장하는 대학과 학과를 한눈에 확인하세요.",
  },
};

export default function SearchPage() {
  const allSubjects = getAllSubjects(courseData);

  return <SearchClient courseData={courseData} allSubjects={allSubjects} />;
}
