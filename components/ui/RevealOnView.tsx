"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealOnViewProps = {
  children: ReactNode;
  delay?: number;        // ms
  threshold?: number;    // 0~1, 뷰포트 안에 몇 % 들어와야 트리거
  rootMargin?: string;   // IntersectionObserver rootMargin
  className?: string;
};

/**
 * 자식 요소가 뷰포트에 들어오면 1회 fade-in + slide-up.
 * SSR 안전 (useEffect 안에서만 IntersectionObserver 접근).
 */
export function RevealOnView({
  children,
  delay = 0,
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  className = "",
}: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 모션 감소 선호 사용자는 즉시 표시
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={`transition-all ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{
        transitionDuration: "1100ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
