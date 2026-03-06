import type { Metadata } from "next";
import Link from "next/link";
import { courseData } from "@/lib/course-data";
import { getUniversityList, getDepartments, getUniversityMeta, getDataLabel } from "@/lib/course-utils";
import { notFound } from "next/navigation";
import { YearBadge } from "@/components/year-badge";
import { Footer } from "@/components/footer";

// 대학별 정적 페이지 생성
export function generateStaticParams() {
  return getUniversityList(courseData).map((name) => ({ name }));
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const univName = decodeURIComponent(name);
  const departments = getDepartments(courseData, univName);

  if (departments.length === 0) return {};

  const yearLabel = getDataLabel(univName);

  return {
    title: `${univName} 권장과목 - ${departments.length}개 학과 (${yearLabel}) | 입시연구소`,
    description: `${univName}의 ${departments.length}개 학과별 핵심권장과목과 권장과목을 확인하세요. ${departments.slice(0, 5).join(", ")} 등. ${yearLabel} 기준.`,
    openGraph: {
      title: `${univName} 학과별 권장과목`,
      description: `${univName} ${departments.length}개 학과의 교과 선택 가이드`,
    },
  };
}

export default async function UniversityPage({ params }: PageProps) {
  const { name } = await params;
  const univName = decodeURIComponent(name);
  const departments = getDepartments(courseData, univName);

  if (departments.length === 0) notFound();

  const meta = getUniversityMeta(univName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/guide"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">
            {univName} 권장과목
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {departments.length}개 학과
            </span>
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
              { "@type": "ListItem", position: 3, name: `${univName} 권장과목` },
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
          <span className="text-slate-900 font-medium">{univName}</span>
        </nav>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {univName} 학과별 권장과목
        </h2>

        {/* 정시 교과평가 안내 */}
        {meta?.regularAdmission && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>정시 교과평가:</strong> {meta.regularAdmission.description}
              {meta.regularAdmission.courseEvalRatio && (
                <span className="ml-1">(반영 비율 {meta.regularAdmission.courseEvalRatio}%)</span>
              )}
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept) => (
            <Link
              key={dept}
              href={`/university/${encodeURIComponent(univName)}/${encodeURIComponent(dept)}`}
              className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600">
                  {dept}
                </span>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
