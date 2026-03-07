"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { type SynergyData, type SynergyEdge, getRelatedSubjects } from "@/lib/synergy-analyzer";
import { categorizeSubject } from "@/lib/subject";
import { Footer } from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import DesktopNav from "@/components/desktop-nav";
import AuthButton from "@/components/auth-button";

// ── Props ──
interface Props {
  synergyData: SynergyData;
  allSubjects: string[];
}

// ── 카테고리 색상 ──
const CAT_BADGE: Record<string, string> = {
  수학: "bg-violet-100 text-violet-800 border-violet-200",
  과학: "bg-emerald-100 text-emerald-800 border-emerald-200",
  사회: "bg-amber-100 text-amber-800 border-amber-200",
  언어: "bg-rose-100 text-rose-800 border-rose-200",
  정보: "bg-cyan-100 text-cyan-800 border-cyan-200",
  기타: "bg-slate-100 text-slate-800 border-slate-200",
};

const CAT_DOT: Record<string, string> = {
  수학: "bg-violet-500",
  과학: "bg-emerald-500",
  사회: "bg-amber-500",
  언어: "bg-rose-500",
  정보: "bg-cyan-500",
  기타: "bg-slate-400",
};

export default function SynergyClient({ synergyData, allSubjects }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 검색 필터된 과목 목록
  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return allSubjects.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return allSubjects.filter((s) => s.toLowerCase().includes(q));
  }, [allSubjects, searchQuery]);

  // 선택된 과목의 시너지 관계
  const relatedEdges: SynergyEdge[] = useMemo(() => {
    if (!selectedSubject) return [];
    return getRelatedSubjects(synergyData, selectedSubject);
  }, [synergyData, selectedSubject]);

  // 시너지 TOP 10 (전체에서 가장 강한 연결)
  const topEdges = useMemo(() => synergyData.edges.slice(0, 10), [synergyData]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* 헤더 */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
                <svg width="18" height="18" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                  <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                  <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                  <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>입시연구소</span>
            </Link>
            <DesktopNav activePath="/synergy" />
            <div className="flex items-center gap-2">
              <AuthButton />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
              style={{ background: "rgba(139, 92, 246, 0.08)", color: "#7c3aed", border: "1px solid rgba(139, 92, 246, 0.16)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" style={{ opacity: 0.7 }} />
              동시 추천 과목 분석
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            과목 시너지 맵
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            어떤 과목이 함께 추천되는지 시너지 관계를 분석합니다
          </p>
        </div>

        {/* 과목 검색/선택 */}
        <section
          className="rounded-2xl p-6 md:p-8 mb-6"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            과목 선택
          </h2>
          <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
            시너지를 확인할 과목을 선택하세요
          </p>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="과목명 검색..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border mb-4 focus:outline-none focus:ring-2 focus:ring-violet-300"
            style={{ background: "var(--surface-2)", borderColor: "var(--border-medium)", color: "var(--text-primary)" }}
          />

          <div className="flex flex-wrap gap-2">
            {filteredSubjects.map((s) => {
              const cat = categorizeSubject(s);
              const isSelected = selectedSubject === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(isSelected ? "" : s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    isSelected
                      ? "ring-2 ring-violet-400 bg-violet-600 text-white border-violet-500"
                      : CAT_BADGE[cat] ?? CAT_BADGE["기타"]
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </section>

        {/* 선택된 과목 시너지 결과 */}
        {selectedSubject && (
          <section
            className="rounded-2xl p-6 md:p-8 mb-6"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${CAT_DOT[categorizeSubject(selectedSubject)] ?? CAT_DOT["기타"]}`} />
              {selectedSubject}의 시너지 과목
            </h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>
              함께 추천되는 빈도가 높은 순서입니다
            </p>

            {relatedEdges.length > 0 ? (
              <div className="space-y-3">
                {(isLoggedIn ? relatedEdges.slice(0, 10) : relatedEdges.slice(0, 3)).map((edge, i) => {
                  const partner = edge.source === selectedSubject ? edge.target : edge.source;
                  const cat = categorizeSubject(partner);
                  const maxCoOcc = relatedEdges[0]?.coOccurrence ?? 1;
                  const barWidth = Math.max(10, (edge.coOccurrence / maxCoOcc) * 100);

                  return (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid var(--border-medium)" }}
                    >
                      <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--surface-2)" }}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold w-6 text-center" style={{ color: "var(--brand-blue)" }}>
                            {i + 1}
                          </span>
                          <span className={`w-2.5 h-2.5 rounded-full ${CAT_DOT[cat] ?? CAT_DOT["기타"]}`} />
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{partner}</span>
                          <span className={`hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-md border ${CAT_BADGE[cat] ?? CAT_BADGE["기타"]}`}>
                            {cat}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {edge.coOccurrence}개 학과
                          </span>
                          {edge.asCore > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">
                              핵심 {edge.asCore}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 바 차트 */}
                      <div className="px-4 py-2">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!isLoggedIn && relatedEdges.length > 3 && (
                  <button
                    onClick={() => signIn()}
                    className="w-full py-3 text-sm font-semibold rounded-xl transition-colors"
                    style={{ background: "rgba(26, 86, 219, 0.08)", color: "var(--brand-blue)" }}
                  >
                    로그인하면 {relatedEdges.length - 3}개 더 볼 수 있어요
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-tertiary)" }}>
                시너지 데이터가 없습니다 (3개 미만 학과에서 추천)
              </p>
            )}
          </section>
        )}

        {/* 클러스터 요약 */}
        {synergyData.clusters.length > 0 && (
          <section
            className="rounded-2xl p-6 md:p-8 mb-6"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>과목 클러스터</h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>
              자주 함께 추천되는 과목 그룹과 관련 학과입니다
            </p>

            <div className="space-y-4">
              {synergyData.clusters.map((cluster, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
                >
                  <h4 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {cluster.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cluster.subjects.map((s) => {
                      const cat = categorizeSubject(s);
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSubject(s)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors hover:opacity-80 ${CAT_BADGE[cat] ?? CAT_BADGE["기타"]}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    관련 학과: {cluster.departments.slice(0, 5).map((d) => `${d.university} ${d.department}`).join(", ")}
                    {cluster.departments.length > 5 && ` 외 ${cluster.departments.length - 5}개`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 전체 시너지 TOP 10 */}
        {!selectedSubject && (
          <section
            className="rounded-2xl p-6 md:p-8 mb-6"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              시너지 TOP 10
            </h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>
              전체 데이터에서 가장 많이 함께 추천되는 과목 쌍입니다
            </p>
            <div className="space-y-2">
              {topEdges.map((edge, i) => {
                const srcCat = categorizeSubject(edge.source);
                const tgtCat = categorizeSubject(edge.target);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-center" style={{ color: "var(--brand-blue)" }}>{i + 1}</span>
                      <span className={`w-2 h-2 rounded-full ${CAT_DOT[srcCat] ?? CAT_DOT["기타"]}`} />
                      <button onClick={() => setSelectedSubject(edge.source)} className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary)" }}>
                        {edge.source}
                      </button>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>+</span>
                      <span className={`w-2 h-2 rounded-full ${CAT_DOT[tgtCat] ?? CAT_DOT["기타"]}`} />
                      <button onClick={() => setSelectedSubject(edge.target)} className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary)" }}>
                        {edge.target}
                      </button>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {edge.coOccurrence}개 학과
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 면책 조항 */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            본 시너지 분석은 대교협 adiga.kr 및 각 대학 입학처 공식 자료를 기반으로 한 참고용 정보입니다.
            <br />
            정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처를 통해 확인하시기 바랍니다.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
