// GAP 4: 평가 방식 안내 — 과목 레벨에 따른 내신 평가 체계
import { classifyCourseLevel, type CourseLevel } from "@/lib/subject";

interface GradingInfoProps {
  subjects: string[];
}

// 과목 목록에서 포함된 레벨 종류 추출
function getLevelsInSubjects(subjects: string[]): Set<CourseLevel> {
  const levels = new Set<CourseLevel>();
  for (const s of subjects) {
    const level = classifyCourseLevel(s);
    if (level) levels.add(level);
  }
  return levels;
}

const GRADING_INFO: Record<CourseLevel, { label: string; grading: string; color: string }> = {
  "공통": {
    label: "공통과목",
    grading: "5등급 상대평가",
    color: "bg-gray-50 border-gray-200 text-gray-700",
  },
  "일반선택": {
    label: "일반선택",
    grading: "5등급 상대평가",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  "진로선택": {
    label: "진로선택",
    grading: "5등급 상대평가",
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  "융합선택": {
    label: "융합선택",
    grading: "성취평가제 (A~E)",
    color: "bg-teal-50 border-teal-200 text-teal-700",
  },
};

export function GradingInfo({ subjects }: GradingInfoProps) {
  const levels = getLevelsInSubjects(subjects);

  if (levels.size === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-slate-700">
          2028학년도 내신 평가 방식 (2022 개정 교육과정)
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["공통", "일반선택", "진로선택", "융합선택"] as CourseLevel[])
          .filter((level) => levels.has(level))
          .map((level) => {
            const info = GRADING_INFO[level];
            return (
              <div
                key={level}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${info.color}`}
              >
                <span className="font-medium">{info.label}</span>
                <span className="opacity-60">→</span>
                <span>{info.grading}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
