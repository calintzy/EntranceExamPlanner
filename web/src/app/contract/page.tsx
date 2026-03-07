import type { Metadata } from "next";
import Link from "next/link";
import { contractData, getTracksByCorporation } from "@/lib/contract-data";
import { Footer } from "@/components/footer";
import BackButton from "@/components/back-button";

export const metadata: Metadata = {
  title: "첨단분야 계약학과 트래커 — 삼성·SK·현대·LG 채용연계 | 입시연구소",
  description:
    "삼성전자, SK하이닉스, 현대자동차, LG전자 등 대기업 채용연계 계약학과 현황. 등록금 전액 지원 + 취업보장 학과를 한눈에 비교하세요.",
  openGraph: {
    title: "첨단분야 계약학과 트래커 — 대기업 채용연계 학과 비교",
    description:
      "삼성·SK·현대·LG 채용연계 계약학과 현황을 한눈에. 등록금·취업보장·인턴십 혜택 비교.",
  },
};

// 기업 로고 색상
const CORP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "삼성전자": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "삼성SDI": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "SK하이닉스": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "현대자동차": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-300" },
  "LG전자": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

function getCorpColor(corp: string) {
  return CORP_COLORS[corp] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
}

export default function ContractPage() {
  const { tracks, summary, categories } = contractData;
  const grouped = getTracksByCorporation(tracks);
  const corpOrder = ["삼성전자", "삼성SDI", "SK하이닉스", "현대자동차", "LG전자"];
  const sortedCorps = corpOrder.filter((c) => grouped[c]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 헤더 */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <BackButton fallbackHref="/" />
          <h1 className="text-lg font-bold text-slate-900">계약학과 트래커</h1>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded ml-auto">
            {summary.description}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 설명 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            대기업 채용연계 계약학과
          </h2>
          <p className="text-slate-600">
            등록금 전액 지원 + 졸업 후 취업보장. 첨단분야 계약학과 현황을 한눈에 확인하세요.
          </p>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{summary.total_universities}</div>
            <div className="text-xs text-slate-500 mt-1">참여 대학</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{summary.total_departments}</div>
            <div className="text-xs text-slate-500 mt-1">계약학과</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{summary.total_enrollment}+</div>
            <div className="text-xs text-slate-500 mt-1">모집인원</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sortedCorps.length}</div>
            <div className="text-xs text-slate-500 mt-1">참여 기업</div>
          </div>
        </div>

        {/* 기업별 트랙 */}
        <div className="space-y-8">
          {sortedCorps.map((corp) => {
            const corpTracks = grouped[corp];
            const color = getCorpColor(corp);
            return (
              <section key={corp}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                    {corp}
                  </span>
                  <span className="text-sm text-slate-500">{corpTracks.length}개 학과</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {corpTracks.map((track) => (
                    <div
                      key={track.track_id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                    >
                      {/* 대학 + 학과 */}
                      <div className="mb-3">
                        <div className="text-sm text-slate-500">{track.university}</div>
                        <div className="text-lg font-bold text-slate-900">{track.department}</div>
                      </div>

                      {/* 프로그램 유형 + 모집인원 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {track.program_type}
                        </span>
                        {track.enrollment && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            모집 {track.enrollment}명
                          </span>
                        )}
                      </div>

                      {/* 혜택 */}
                      <div className="space-y-1.5 text-sm">
                        {track.benefits.tuition && (
                          <div className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-slate-700">{track.benefits.tuition}</span>
                          </div>
                        )}
                        {track.benefits.stipend && (
                          <div className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-slate-700">{track.benefits.stipend}</span>
                          </div>
                        )}
                        {track.benefits.internship && (
                          <div className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-slate-700">인턴십 연계</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 ${track.benefits.employment_guarantee ? "text-green-500" : "text-amber-500"}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {track.benefits.employment_guarantee ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                              )}
                            </svg>
                          </span>
                          <span className={track.benefits.employment_guarantee ? "text-slate-700 font-medium" : "text-slate-500"}>
                            {track.benefits.employment_guarantee ? "취업 보장" : "취업 우대 (보장 아님)"}
                          </span>
                        </div>
                        {track.benefits.other && (
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                            <span className="text-slate-600 text-xs">{track.benefits.other}</span>
                          </div>
                        )}
                      </div>

                      {/* 비고 */}
                      {track.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-500">{track.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* 카테고리 안내 */}
        <div className="mt-12 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">계약학과 유형</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-sm font-semibold text-slate-900 mb-2">취업연계형</div>
              <p className="text-xs text-slate-600 mb-3">{categories.employment_linked.description}</p>
              <div className="flex flex-wrap gap-1">
                {categories.employment_linked.universities.map((u) => (
                  <span key={u} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                    {u}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-sm font-semibold text-slate-900 mb-2">조기취업형</div>
              <p className="text-xs text-slate-600">{categories.early_employment.description}</p>
              <p className="text-xs text-slate-400 mt-2">{categories.early_employment.notes}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-sm font-semibold text-slate-900 mb-2">군의무복무형</div>
              <p className="text-xs text-slate-600 mb-3">{categories.military_linked.description}</p>
              <div className="flex flex-wrap gap-1">
                {categories.military_linked.universities.map((u) => (
                  <span key={u} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 면책 */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>참고:</strong> 본 정보는 {contractData.year}학년도 기준이며,
            세부사항은 각 대학 입학처 공지를 확인하세요.
            데이터 기준일: {contractData.last_updated}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
