import type { Metadata } from "next";
import Link from "next/link";
import { courseData } from "@/lib/course-data";
import { getUniversityList, getDepartments } from "@/lib/course-utils";
import { notFound } from "next/navigation";

// 6개 대학 정적 페이지 생성
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

  return {
    title: `${univName} 권장과목 - ${departments.length}개 학과 | 입시플래너`,
    description: `${univName}의 ${departments.length}개 학과별 핵심권장과목과 권장과목을 확인하세요. ${departments.slice(0, 5).join(", ")} 등`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/guide"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {univName} 권장과목
          </h1>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded ml-auto">
            {departments.length}개 학과
          </span>
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
          <span className="text-slate-900 dark:text-white font-medium">{univName}</span>
        </nav>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {univName} 학과별 권장과목
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept) => (
            <Link
              key={dept}
              href={`/university/${encodeURIComponent(univName)}/${encodeURIComponent(dept)}`}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
