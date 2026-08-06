"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * 스크롤 리빌 래퍼 — 뷰포트에 들어오면 자식을 fade-up으로 한 번만 등장시킨다.
 * 숨김/전환 스타일은 globals.css의 .reveal 블록이 담당하며,
 * no-JS·reduced-motion 환경에서는 CSS 미디어쿼리가 꺼져 항상 즉시 보인다.
 */
export default function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** 스태거용 지연(ms). 카드 그리드에서 index * 80 정도로 전달 */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // reduced-motion 처리는 globals.css의 미디어쿼리가 전담한다 —
  // 숨김 스타일 자체가 적용되지 않으므로 여기서 따로 분기하지 않는다.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // 뷰포트 하단 10% 지점을 지나야 발동 — 등장하는 모습이 보이도록
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className ?? ""}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
