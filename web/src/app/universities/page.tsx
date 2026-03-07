import Link from "next/link";
import type { Metadata } from "next";
import { courseData } from "@/lib/course-data";
import { getUniversityList } from "@/lib/course-utils";
import universityMeta from "@/lib/university_meta.json";
import { BRAND_NAME, UNIVERSITY_COUNT } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `수록 대학 목록 (${UNIVERSITY_COUNT}개교) — ${BRAND_NAME}`,
  description: `${BRAND_NAME}에 수록된 전국 ${UNIVERSITY_COUNT}개 대학의 전공연계 권장과목 정보를 확인하세요. 권역별로 정리된 대학 목록입니다.`,
};

const universities = getUniversityList(courseData);

type MetaEntry = { year: number; region?: string; location?: string; source: string };
const meta = universityMeta as Record<string, MetaEntry>;
const regionGroups: Record<string, string[]> = {};
for (const name of universities) {
  const m = meta[name];
  const region = m?.region ?? "주요 대학";
  if (!regionGroups[region]) regionGroups[region] = [];
  regionGroups[region].push(name);
}
const regionOrder = ["주요 대학", "수도권", "중부권", "영남권", "호남권"];

const regionColorMap: Record<string, string> = {
  "주요 대학": "text-blue-600",
  수도권: "text-indigo-600",
  중부권: "text-emerald-600",
  영남권: "text-amber-600",
  호남권: "text-violet-600",
};

const regionChipColorMap: Record<string, string> = {
  "주요 대학": "hover:bg-blue-600 hover:text-white hover:border-blue-600",
  수도권: "hover:bg-indigo-600 hover:text-white hover:border-indigo-600",
  중부권: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
  영남권: "hover:bg-amber-600 hover:text-white hover:border-amber-600",
  호남권: "hover:bg-violet-600 hover:text-white hover:border-violet-600",
};

export default function UniversitiesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* 헤더 간략 */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                <svg width="18" height="18" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                  <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                  <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                  <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                입시연구소
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--brand-blue)" }}
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
            Coverage
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            수록 대학 ({universities.length}개교)
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            대학명을 클릭하면 학과별 권장과목을 확인할 수 있습니다
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border-subtle)", background: "var(--surface-1)", boxShadow: "var(--shadow-card)" }}
        >
          {regionOrder.filter((r) => regionGroups[r]).map((region, idx, arr) => (
            <div key={region}>
              <div
                className="px-6 md:px-8 py-4 flex items-center gap-3"
                style={{
                  background: idx === 0 ? "var(--surface-2)" : undefined,
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span className={`region-badge text-sm font-bold ${regionColorMap[region] || "text-slate-500"}`}>
                  {region}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "var(--border-subtle)", color: "var(--text-tertiary)" }}
                >
                  {regionGroups[region].length}개교
                </span>
              </div>

              <div
                className="px-6 md:px-8 py-5 flex flex-wrap gap-2"
                style={{ borderBottom: idx < arr.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
              >
                {regionGroups[region].map((name) => (
                  <Link
                    key={name}
                    href={`/university/${encodeURIComponent(name)}`}
                    className={`uni-chip px-3 py-1.5 text-sm font-medium rounded-full ${regionChipColorMap[region] || "hover:bg-blue-600 hover:text-white hover:border-blue-600"}`}
                    style={{ color: "var(--text-secondary)", background: "var(--surface-glass)", border: "1px solid var(--border-medium)" }}
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 CTA */}
        <div className="text-center mt-12">
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
            style={{ color: "var(--brand-blue)", background: "rgba(26, 86, 219, 0.08)", border: "1px solid rgba(26, 86, 219, 0.16)" }}
          >
            교과 선택 가이드 시작하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
