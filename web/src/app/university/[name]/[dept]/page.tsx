import type { Metadata } from "next";
import Link from "next/link";
import { courseData } from "@/lib/course-data";
import {
  getUniversityList,
  getDepartments,
  getCourseRecommendation,
  compareUniversities,
} from "@/lib/course-utils";
import { categorizeSubject } from "@/lib/subject";
import { notFound } from "next/navigation";

// 대학×학과 모든 조합으로 정적 페이지 생성
export function generateStaticParams() {
  const params: { name: string; dept: string }[] = [];
  for (const name of getUniversityList(courseData)) {
    for (const dept of getDepartments(courseData, name)) {
      params.push({ name, dept });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ name: string; dept: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name, dept } = await params;
  const univName = decodeURIComponent(name);
  const deptName = decodeURIComponent(dept);

  const rec = getCourseRecommendation(courseData, univName, deptName);
  if (!rec) return {};

  const allSubjects = [...rec.core, ...rec.recommended].slice(0, 5).join(", ");

  return {
    title: `${univName} ${deptName} 권장과목 | 입시플래너`,
    description: `${univName} ${deptName}의 핵심권장과목과 권장과목을 확인하세요. ${allSubjects} 등 교과 선택 가이드.`,
    openGraph: {
      title: `${univName} ${deptName} 권장과목`,
      description: `핵심권장: ${rec.core.join(", ") || "없음"} / 권장: ${rec.recommended.join(", ") || "없음"}`,
    },
  };
}

const coreColorMap: Record<string, string> = {
  수학: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  과학: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  사회: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  기타: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

const recColorMap: Record<string, string> = {
  수학: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-100 dark:border-violet-900",
  과학: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
  사회: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900",
  기타: "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-100 dark:border-slate-800",
};

export default async function DepartmentPage({ params }: PageProps) {
  const { name, dept } = await params;
  const univName = decodeURIComponent(name);
  const deptName = decodeURIComponent(dept);

  const recommendation = getCourseRecommendation(courseData, univName, deptName);
  if (!recommendation) notFound();

  // 같은 학과의 다른 대학 비교
  const keyword = deptName.replace(/학과|학부|전공|계열|대학/g, "");
  const comparison = compareUniversities(courseData, keyword).filter(
    (item) => item.university !== univName
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/university/${encodeURIComponent(univName)}`}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {univName} {deptName}
          </h1>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded ml-auto">
            2026학년도
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 네비게이션 경로 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">홈</Link>
          <span className="mx-2">/</span>
          <Link href="/guide" className="hover:text-blue-600">교과 선택 가이드</Link>
          <span className="mx-2">/</span>
          <Link href={`/university/${encodeURIComponent(univName)}`} className="hover:text-blue-600">{univName}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white font-medium">{deptName}</span>
        </nav>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {univName} {deptName} 권장과목
          </h2>

          {/* 핵심권장과목 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">핵심권장과목</h3>
              <span className="text-xs text-slate-500 ml-2">반드시 이수해야 하는 과목</span>
            </div>
            {recommendation.core.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recommendation.core.map((subject, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${coreColorMap[categorizeSubject(subject)]}`}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">지정된 핵심권장과목이 없습니다. 진로/적성에 맞는 과목을 자유롭게 선택하세요.</p>
            )}
          </div>

          {/* 권장과목 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">권장과목</h3>
              <span className="text-xs text-slate-500 ml-2">이수하면 유리한 과목</span>
            </div>
            {recommendation.recommended.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recommendation.recommended.map((subject, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm border ${recColorMap[categorizeSubject(subject)]}`}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">추가 권장과목이 없습니다.</p>
            )}
          </div>

          {/* 안내 */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>참고:</strong> 권장과목 미이수가 지원 자격을 제한하지는 않지만, 학생부종합전형 서류평가와 정시 교과평가에서 불이익이 있을 수 있습니다.
            </p>
          </div>

          {/* 다른 대학 비교 */}
          {comparison.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                다른 대학의 유사 학과 권장과목
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">대학</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">학과</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />핵심</span>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />권장</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((item, idx) => (
                      <tr
                        key={`${item.university}-${item.matchedDept}`}
                        className={idx < comparison.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}
                      >
                        <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">
                          <Link
                            href={`/university/${encodeURIComponent(item.university)}/${encodeURIComponent(item.matchedDept)}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {item.university}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{item.matchedDept}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.core.length > 0 ? item.core.map((s, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded border border-red-100 dark:border-red-900">{s}</span>
                            )) : <span className="text-xs text-slate-400">없음</span>}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.recommended.length > 0 ? item.recommended.map((s, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900">{s}</span>
                            )) : <span className="text-xs text-slate-400">없음</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-400 space-y-2">
          <p>데이터 출처: 각 대학 입학처 모집요강 및 전공연계 교과이수 안내자료 (2026학년도)</p>
          <p>본 서비스는 참고용 정보를 제공하며, 대학 입학 전형의 공식 기준이 아닙니다.</p>
          <p>정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처 공식 자료를 통해 확인하시기 바랍니다.</p>
        </div>
      </footer>
    </div>
  );
}
