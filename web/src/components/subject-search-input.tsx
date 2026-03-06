"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  categorizeSubject,
  classifyCourseLevel,
  CORE_COLOR_MAP,
} from "@/lib/subject";

interface SubjectSearchInputProps {
  subjects: string[];
  selectedSubjects: string[];
  onAdd: (subject: string) => void;
  onRemove: (subject: string) => void;
}

export default function SubjectSearchInput({
  subjects,
  selectedSubjects,
  onAdd,
  onRemove,
}: SubjectSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 이미 선택된 과목 제외 + 검색 필터링 (최대 10개)
  const filtered = query.trim()
    ? subjects
        .filter(
          (s) =>
            s.toLowerCase().includes(query.trim().toLowerCase()) &&
            !selectedSubjects.includes(s)
        )
        .slice(0, 10)
    : [];

  const hasResults = filtered.length > 0;

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 하이라이트 인덱스 리셋
  useEffect(() => {
    setHighlightIndex(-1);
  }, [query]);

  // 스크롤 보정
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const selectSubject = useCallback(
    (subject: string) => {
      onAdd(subject);
      setQuery("");
      setIsOpen(false);
      // 포커스 유지 — 연속 추가 가능
      inputRef.current?.focus();
    },
    [onAdd]
  );

  // 키보드 내비게이션
  function handleKeyDown(e: React.KeyboardEvent) {
    // Backspace로 마지막 선택 제거
    if (e.key === "Backspace" && !query && selectedSubjects.length > 0) {
      onRemove(selectedSubjects[selectedSubjects.length - 1]);
      return;
    }

    if (!isOpen || !hasResults) {
      if (e.key === "ArrowDown" && query.trim()) {
        setIsOpen(true);
        setHighlightIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          selectSubject(filtered[highlightIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex flex-wrap items-center gap-1.5 pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-shadow min-h-[48px]">
        {/* 검색 아이콘 */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* 선택된 과목 pills (인라인) */}
        {selectedSubjects.map((subject) => (
          <span
            key={subject}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-medium"
          >
            {subject}
            <button
              onClick={() => onRemove(subject)}
              className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
              aria-label={`${subject} 제거`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedSubjects.length === 0
              ? "과목명을 입력하세요 (예: 미적분, 물리학)"
              : "과목 추가..."
          }
          className="flex-1 min-w-[120px] py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* 드롭다운 */}
      {isOpen && query.trim() && (
        <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {hasResults ? (
            <ul ref={listRef} className="max-h-80 overflow-y-auto py-1">
              {filtered.map((subject, idx) => {
                const category = categorizeSubject(subject);
                const level = classifyCourseLevel(subject);
                const isHighlighted = idx === highlightIndex;

                return (
                  <li key={subject}>
                    <button
                      type="button"
                      onClick={() => selectSubject(subject)}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm transition-colors ${
                        isHighlighted
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* 카테고리 색상 점 */}
                      <span
                        className={`shrink-0 w-2 h-2 rounded-full ${
                          CORE_COLOR_MAP[category]?.split(" ")[0] || "bg-slate-300"
                        }`}
                      />
                      <span className="flex-1 text-slate-900">{subject}</span>
                      {level && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {level === "일반선택"
                            ? "일반"
                            : level === "진로선택"
                            ? "진로"
                            : level === "융합선택"
                            ? "융합"
                            : level}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              &ldquo;{query}&rdquo;에 해당하는 과목이 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
