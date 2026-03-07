"use client";

import { useState } from "react";
import Link from "next/link";

// 그룹화된 네비게이션 구조
const NAV_GROUPS = [
  {
    label: null, // 그룹 헤더 없음
    items: [
      { href: "/guide", label: "교과 가이드" },
      { href: "/search", label: "과목 검색" },
    ],
  },
  {
    label: "분석 도구",
    items: [
      { href: "/my-strategy", label: "맞춤 전략" },
      { href: "/portfolio", label: "포트폴리오" },
      { href: "/synergy", label: "시너지 맵" },
      { href: "/timeline", label: "타임라인" },
      { href: "/compare", label: "비교하기" },
    ],
  },
  {
    label: null,
    items: [
      { href: "/policy", label: "2028 정책" },
      { href: "/contract", label: "계약학과" },
    ],
  },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)" }}
        aria-label="메뉴 열기"
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* 드롭다운 메뉴 */}
          <nav
            className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-medium)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi}>
                {/* 그룹 구분선 (첫 번째 그룹 제외) */}
                {gi > 0 && (
                  <div className="h-px mx-3" style={{ background: "var(--border-medium)" }} />
                )}
                {/* 그룹 헤더 */}
                {group.label && (
                  <div
                    className="px-4 pt-2.5 pb-1"
                  >
                    <span className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      {group.label}
                    </span>
                  </div>
                )}
                {/* 메뉴 아이템 */}
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium transition-colors footer-link"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
