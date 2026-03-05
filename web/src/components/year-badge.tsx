// 대학 데이터 연도 배지 — "2026학년도" / "2028학년도" 동적 표시
import { getDataLabel, getUniversityMeta } from "@/lib/course-utils";

interface YearBadgeProps {
  university: string;
}

export function YearBadge({ university }: YearBadgeProps) {
  const label = getDataLabel(university);
  const meta = getUniversityMeta(university);
  const curriculum = meta?.curriculum;

  // 2028 데이터는 파란색, 2026 데이터는 회색
  const is2028 = meta?.year === 2028;
  const badgeClass = is2028
    ? "bg-blue-50 text-blue-600 border border-blue-200"
    : "bg-slate-100 text-slate-500";

  return (
    <span className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1.5 ${badgeClass} ${is2028 ? "year-badge-2028" : ""}`}>
      {label}
      {curriculum && (
        <span className="text-[10px] opacity-70">
          ({curriculum})
        </span>
      )}
    </span>
  );
}
