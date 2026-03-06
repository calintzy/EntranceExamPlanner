import type { Metadata } from "next";
import Link from "next/link";
import { courseData } from "@/lib/course-data";
import {
  getUniversityList,
  getDepartments,
  getCourseRecommendation,
  compareUniversities,
  getUniversityMeta,
  getDataLabel,
} from "@/lib/course-utils";
import {
  categorizeSubject,
  classifyCourseLevel,
  isSameCourse,
  CORE_COLOR_MAP,
  REC_COLOR_MAP,
  LEVEL_COLORS,
} from "@/lib/subject";
import { notFound } from "next/navigation";
import { YearBadge } from "@/components/year-badge";
import { Footer } from "@/components/footer";
import { GradingInfo } from "@/components/grading-info";

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
  const yearLabel = getDataLabel(univName);

  return {
    title: `${univName} ${deptName} 권장과목 (${yearLabel}) | 입시연구소`,
    description: `${univName} ${deptName}의 핵심권장과목과 권장과목을 확인하세요. ${allSubjects} 등 교과 선택 가이드. ${yearLabel} 기준.`,
    openGraph: {
      title: `${univName} ${deptName} 권장과목`,
      description: `핵심권장: ${rec.core.join(", ") || "없음"} / 권장: ${rec.recommended.join(", ") || "없음"}`,
    },
  };
}

export default async function DepartmentPage({ params }: PageProps) {
  const { name, dept } = await params;
  const univName = decodeURIComponent(name);
  const deptName = decodeURIComponent(dept);

  const recommendation = getCourseRecommendation(courseData, univName, deptName);
  if (!recommendation) notFound();

  const meta = getUniversityMeta(univName);
  const allSubjects = [...recommendation.core, ...recommendation.recommended];

  // 같은 학과의 다른 대학 비교
  const keyword = deptName.replace(/학과|학부|전공|계열|대학/g, "");
  const comparison = compareUniversities(courseData, keyword).filter(
    (item) => item.university !== univName
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/university/${encodeURIComponent(univName)}`}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">
            {univName} {deptName}
          </h1>
          <div className="ml-auto">
            <YearBadge university={univName} />
          </div>
        </div>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "홈", item: "https://web-kappa-sable-82.vercel.app" },
              { "@type": "ListItem", position: 2, name: "교과 선택 가이드", item: "https://web-kappa-sable-82.vercel.app/guide" },
              { "@type": "ListItem", position: 3, name: univName, item: `https://web-kappa-sable-82.vercel.app/university/${encodeURIComponent(univName)}` },
              { "@type": "ListItem", position: 4, name: `${deptName} 권장과목` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `${univName} ${deptName}의 핵심권장과목은 무엇인가요?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: recommendation.core.length > 0
                    ? `${univName} ${deptName}의 핵심권장과목은 ${recommendation.core.join(", ")}입니다.`
                    : `${univName} ${deptName}은 별도의 핵심권장과목을 지정하지 않았습니다.`,
                },
              },
              {
                "@type": "Question",
                name: `${univName} ${deptName}의 권장과목은 무엇인가요?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: recommendation.recommended.length > 0
                    ? `${univName} ${deptName}의 권장과목은 ${recommendation.recommended.join(", ")}입니다.`
                    : `${univName} ${deptName}은 별도의 권장과목을 지정하지 않았습니다.`,
                },
              },
            ],
          }),
        }}
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 네비게이션 경로 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">홈</Link>
          <span className="mx-2">/</span>
          <Link href="/guide" className="hover:text-blue-600">교과 선택 가이드</Link>
          <span className="mx-2">/</span>
          <Link href={`/university/${encodeURIComponent(univName)}`} className="hover:text-blue-600">{univName}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">{deptName}</span>
        </nav>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {univName} {deptName} 권장과목
          </h2>

          {/* 핵심권장과목 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="text-base font-semibold text-slate-900">핵심권장과목</h3>
              <span className="text-xs text-slate-500 ml-2">반드시 이수해야 하는 과목</span>
            </div>
            {recommendation.core.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recommendation.core.map((subject, i) => {
                  const level = classifyCourseLevel(subject);
                  return (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <span
                        className={`subject-tag inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${CORE_COLOR_MAP[categorizeSubject(subject)]}`}
                      >
                        {subject}
                      </span>
                      {level && (
                        <span className={`level-badge inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${LEVEL_COLORS[level]}`}>
                          {level}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">지정된 핵심권장과목이 없습니다. 진로/적성에 맞는 과목을 자유롭게 선택하세요.</p>
            )}
          </div>

          {/* 권장과목 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-base font-semibold text-slate-900">권장과목</h3>
              <span className="text-xs text-slate-500 ml-2">이수하면 유리한 과목</span>
            </div>
            {recommendation.recommended.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recommendation.recommended.map((subject, i) => {
                  const level = classifyCourseLevel(subject);
                  return (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <span
                        className={`subject-tag inline-flex items-center px-3 py-1.5 rounded-lg text-sm border ${REC_COLOR_MAP[categorizeSubject(subject)]}`}
                      >
                        {subject}
                      </span>
                      {level && (
                        <span className={`level-badge inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${LEVEL_COLORS[level]}`}>
                          {level}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">추가 권장과목이 없습니다.</p>
            )}
          </div>

          {/* 평가 방식 안내 (GAP 4) */}
          <GradingInfo subjects={allSubjects} />

          {/* 정시 교과평가 정보 (GAP 5) */}
          {meta?.regularAdmission && (
            <div className="eval-box bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-blue-800">
                  {univName} 정시 교과평가
                </span>
              </div>
              <p className="text-sm text-blue-700">
                {meta.regularAdmission.description}
              </p>
              {meta.regularAdmission.courseEvalRatio && (
                <p className="text-xs text-blue-600 mt-1">
                  교과평가 반영 비율: {meta.regularAdmission.courseEvalRatio}%
                </p>
              )}
            </div>
          )}

          {/* 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>참고:</strong> 권장과목 미이수가 지원 자격을 제한하지는 않지만, 학생부종합전형 서류평가와 정시 교과평가에서 불이익이 있을 수 있습니다.
            </p>
          </div>

          {/* 다른 대학 비교 */}
          {comparison.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                다른 대학의 유사 학과 권장과목
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50">대학</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50">학과</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />핵심</span>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />권장</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((item, idx) => (
                      <tr
                        key={`${item.university}-${item.matchedDept}`}
                        className={idx < comparison.length - 1 ? "border-b border-slate-100" : ""}
                      >
                        <td className="px-6 py-3 text-sm font-medium text-slate-900">
                          <Link
                            href={`/university/${encodeURIComponent(item.university)}/${encodeURIComponent(item.matchedDept)}`}
                            className="hover:text-blue-600"
                          >
                            {item.university}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">{item.matchedDept}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.core.length > 0 ? item.core.map((s, i) => {
                              // 현재 대학 핵심과목과 동일 과목이면 하이라이트
                              const isShared = recommendation.core.some((c) => isSameCourse(c, s));
                              return (
                                <span
                                  key={i}
                                  className={`inline-block px-2 py-0.5 text-xs rounded border ${
                                    isShared
                                      ? "bg-red-100 text-red-800 border-red-300 font-semibold"
                                      : "bg-red-50 text-red-700 border-red-100"
                                  }`}
                                >
                                  {s}
                                </span>
                              );
                            }) : <span className="text-xs text-slate-400">없음</span>}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.recommended.length > 0 ? item.recommended.map((s, i) => {
                              const isShared = recommendation.recommended.some((r) => isSameCourse(r, s));
                              return (
                                <span
                                  key={i}
                                  className={`inline-block px-2 py-0.5 text-xs rounded border ${
                                    isShared
                                      ? "bg-blue-100 text-blue-800 border-blue-300 font-semibold"
                                      : "bg-blue-50 text-blue-700 border-blue-100"
                                  }`}
                                >
                                  {s}
                                </span>
                              );
                            }) : <span className="text-xs text-slate-400">없음</span>}
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

      <Footer />
    </div>
  );
}
