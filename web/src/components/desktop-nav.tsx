"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// 분석 도구 드롭다운 항목
const ANALYSIS_ITEMS = [
  { href: "/my-strategy", label: "맞춤 전략" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/synergy", label: "시너지 맵" },
  { href: "/timeline", label: "타임라인" },
  { href: "/compare", label: "비교하기" },
];

interface DesktopNavProps {
  /** 현재 활성 경로 (해당 항목 하이라이트) */
  activePath?: string;
}

export default function DesktopNav({ activePath }: DesktopNavProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const isAnalysisActive = ANALYSIS_ITEMS.some((item) => item.href === activePath);

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="메인 네비게이션">
      <Link
        href="/guide"
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link"
        style={activePath === "/guide" ? { color: "var(--brand-blue)", fontWeight: 700 } : { color: "var(--text-secondary)" }}
      >
        교과 가이드
      </Link>
      <Link
        href="/search"
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link"
        style={activePath === "/search" ? { color: "var(--brand-blue)", fontWeight: 700 } : { color: "var(--text-secondary)" }}
      >
        과목 검색
      </Link>

      {/* 분석 도구 드롭다운 */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          style={isAnalysisActive ? { color: "var(--brand-blue)", fontWeight: 700 } : { color: "var(--text-secondary)" }}
          aria-expanded={open}
          aria-haspopup="true"
        >
          분석 도구
          <svg
            className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute left-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-50"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-medium)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            }}
          >
            {ANALYSIS_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                style={
                  activePath === item.href
                    ? { color: "var(--brand-blue)", fontWeight: 700, background: "rgba(26, 86, 219, 0.06)" }
                    : { color: "var(--text-primary)" }
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/policy"
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link"
        style={activePath === "/policy" ? { color: "var(--brand-blue)", fontWeight: 700 } : { color: "var(--text-secondary)" }}
      >
        2028 정책
      </Link>
      <Link
        href="/contract"
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors footer-link"
        style={activePath === "/contract" ? { color: "var(--brand-blue)", fontWeight: 700 } : { color: "var(--text-secondary)" }}
      >
        계약학과
      </Link>
    </nav>
  );
}
