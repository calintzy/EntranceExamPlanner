"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3;
}

/**
 * 스크롤 시 요소가 뷰포트에 진입하면 .is-visible 클래스를 추가하여
 * CSS 트랜지션을 트리거하는 컴포넌트
 */
export default function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay > 0 ? ` scroll-reveal-delay-${delay}` : "";

  return (
    <div ref={ref} className={`scroll-reveal${delayClass} ${className}`}>
      {children}
    </div>
  );
}
