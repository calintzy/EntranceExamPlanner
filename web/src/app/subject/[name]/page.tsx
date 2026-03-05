import type { Metadata } from "next";
import Link from "next/link";
import { courseData } from "@/lib/course-data";
import {
  getAllSubjects,
  searchBySubject,
  getDataLabel,
} from "@/lib/course-utils";
import { categorizeSubject, classifyCourseLevel, LEVEL_COLORS } from "@/lib/subject";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { GradingInfo } from "@/components/grading-info";

// 모든 고유 과목에 대해 정적 페이지 생성
export function generateStaticParams() {
  return getAllSubjects(courseData).map((name) => ({ name }));
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const subjectName = decodeURIComponent(name);
  const results = searchBySubject(courseData, subjectName);

  if (results.length === 0) return {};

  const coreCount = results.filter((r) => r.type === "core").length;
  const recCount = results.filter((r) => r.type === "recommended").length;
  const univs = [...new Set(results.map((r) => r.university))];

  return {
    title: `${subjectName} 권장 대학/학과 - ${results.length}개 학과 | 입시플래너`,
    description: `${subjectName}을(를) 핵심권장(${coreCount}개) 또는 권장(${recCount}개)하는 대학과 학과 목록. ${univs.join(", ")} 등.`,
    openGraph: {
      title: `${subjectName} - 이 과목을 권장하는 대학은?`,
      description: `${univs.join(", ")} 등 ${results.length}개 학과에서 ${subjectName}을(를) 권장합니다.`,
    },
  };
}

export default async function SubjectPage({ params }: PageProps) {
  const { name } = await params;
  const subjectName = decodeURIComponent(name);
  const results = searchBySubject(courseData, subjectName);

  if (results.length === 0) notFound();

  const category = categorizeSubject(subjectName);
  const courseLevel = classifyCourseLevel(subjectName);
  const coreResults = results.filter((r) => r.type === "core");
  const recResults = results.filter((r) => r.type === "recommended");

  // 대학별 그룹핑
  const byUniversity = results.reduce(
    (acc, r) => {
      if (!acc[r.university]) acc[r.university] = [];
      acc[r.university].push(r);
      return acc;
    },
    {} as Record<string, typeof results>
  );

  const categoryColor: Record<string, string> = {
    수학: "text-violet-600",
    과학: "text-emerald-600",
    사회: "text-amber-600",
    기타: "text-slate-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/search"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">
            {subjectName}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColor[category]}`}>
              {category}
            </span>
            {courseLevel && (
              <span className={`level-badge text-xs font-medium px-2 py-1 rounded border ${LEVEL_COLORS[courseLevel]}`}>
                {courseLevel}
              </span>
            )}
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
              { "@type": "ListItem", position: 2, name: "역방향 검색", item: "https://web-kappa-sable-82.vercel.app/search" },
              { "@type": "ListItem", position: 3, name: subjectName },
            ],
          }),
        }}
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 네비게이션 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">홈</Link>
          <span className="mx-2">/</span>
          <Link href="/search" className="hover:text-blue-600">역방향 검색</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">{subjectName}</span>
        </nav>

        <div className="space-y-8">
          {/* 요약 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {subjectName}을(를) 권장하는 대학/학과
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
                <div className="text-2xl font-bold text-slate-900">{results.length}</div>
                <div className="text-xs text-slate-500">전체 학과</div>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 px-4 py-3 text-center">
                <div className="text-2xl font-bold text-red-700">{coreResults.length}</div>
                <div className="text-xs text-red-600">핵심권장</div>
              </div>
              <div className="bg-blue-50 rounded-xl border border-blue-200 px-4 py-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{recResults.length}</div>
                <div className="text-xs text-blue-600">권장</div>
              </div>
            </div>
          </div>

          {/* 평가 방식 안내 */}
          <GradingInfo subjects={[subjectName]} />

          {/* 핵심권장 학과 */}
          {coreResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-lg font-semibold text-slate-900">
                  핵심권장과목으로 지정한 학과
                </h3>
                <span className="text-sm text-slate-500">({coreResults.length}개)</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {Object.entries(byUniversity)
                  .filter(([, items]) => items.some((i) => i.type === "core"))
                  .map(([univ, items], uIdx, arr) => (
                    <div
                      key={univ}
                      className={uIdx < arr.length - 1 ? "border-b border-slate-100" : ""}
                    >
                      <div className="px-6 py-3 flex items-start gap-4">
                        <Link
                          href={`/university/${encodeURIComponent(univ)}`}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-600 min-w-[4rem]"
                        >
                          {univ}
                        </Link>
                        <div className="flex flex-wrap gap-2">
                          {items
                            .filter((i) => i.type === "core")
                            .map((item) => (
                              <Link
                                key={item.department}
                                href={`/university/${encodeURIComponent(univ)}/${encodeURIComponent(item.department)}`}
                                className="inline-block px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                              >
                                {item.department}
                              </Link>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 권장 학과 */}
          {recResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-lg font-semibold text-slate-900">
                  권장과목으로 지정한 학과
                </h3>
                <span className="text-sm text-slate-500">({recResults.length}개)</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {Object.entries(byUniversity)
                  .filter(([, items]) => items.some((i) => i.type === "recommended"))
                  .map(([univ, items], uIdx, arr) => (
                    <div
                      key={univ}
                      className={uIdx < arr.length - 1 ? "border-b border-slate-100" : ""}
                    >
                      <div className="px-6 py-3 flex items-start gap-4">
                        <Link
                          href={`/university/${encodeURIComponent(univ)}`}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-600 min-w-[4rem]"
                        >
                          {univ}
                        </Link>
                        <div className="flex flex-wrap gap-2">
                          {items
                            .filter((i) => i.type === "recommended")
                            .map((item) => (
                              <Link
                                key={item.department}
                                href={`/university/${encodeURIComponent(univ)}/${encodeURIComponent(item.department)}`}
                                className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                              >
                                {item.department}
                              </Link>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>참고:</strong> 권장과목 미이수가 지원 자격을 제한하지는 않지만, 학생부종합전형 서류평가와 정시 교과평가에서 불이익이 있을 수 있습니다.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
