import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* 헤더 */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            입시플래너
          </h1>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            2026학년도
          </span>
        </div>
      </header>

      {/* 히어로 */}
      <main className="max-w-5xl mx-auto px-6">
        <section className="py-20 text-center">
          <div className="inline-block mb-4 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40 rounded-full">
            베타 서비스
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            목표 대학에 맞는<br />
            <span className="text-blue-600 dark:text-blue-400">교과 선택</span>을 안내합니다
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            서울대, 연세대, 고려대 등 주요 6개 대학의 전공연계 핵심권장과목과 권장과목을 한눈에 비교하세요. 고1부터 시작하는 전략적 교과 선택이 합격의 첫걸음입니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
            >
              교과 선택 가이드
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              내 과목으로 대학 찾기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>
        </section>

        {/* 기능 카드 */}
        <section className="pb-20 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              핵심권장과목 확인
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              대학이 공식 지정한 전공 연계 핵심권장과목을 학과별로 확인할 수 있습니다.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              대학간 비교
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              같은 학과라도 대학마다 다른 권장과목. 6개 대학을 한눈에 비교합니다.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              입시 전형 정보
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              수시/정시 전형별 모집인원, 수능 최저, 반영비율 등 핵심 정보를 제공합니다.
            </p>
          </div>
        </section>

        {/* 대학 목록 */}
        <section className="pb-20">
          <h3 className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
            현재 지원하는 대학
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["서울대", "연세대", "고려대", "성균관대", "경희대", "중앙대"].map((name) => (
              <span
                key={name}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            한양대, 서강대, 이화여대, 건국대, 동국대 등 추가 예정
          </p>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-400 space-y-2">
          <p>2026학년도 입시 기준 | 데이터 출처: 각 대학 입학처 모집요강 및 전공연계 교과이수 안내자료</p>
          <p>본 서비스는 참고용 정보를 제공하며, 대학 입학 전형의 공식 기준이 아닙니다.</p>
          <p>정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처 공식 자료를 통해 확인하시기 바랍니다.</p>
        </div>
      </footer>
    </div>
  );
}
