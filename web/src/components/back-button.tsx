"use client";

import { useRouter } from "next/navigation";

/** 브라우저 히스토리 기반 뒤로가기 버튼. 히스토리가 없으면 fallbackHref로 이동. */
export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="text-slate-500 hover:text-slate-700 transition-colors"
      aria-label="뒤로 가기"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
