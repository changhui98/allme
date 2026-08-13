"use client";

import { useEffect, useState } from "react";

/**
 * 약관·정책 문서의 목차 (스크롤스파이).
 * IntersectionObserver로 현재 읽고 있는 장을 감지해 하이라이트한다.
 * 링크 자체는 일반 앵커(#id)라 no-JS·크롤러 환경에서도 이동은 그대로 동작하며,
 * JS는 하이라이트만 담당한다 — ScrollReveal과 같은 점진적 향상 원칙.
 * 스타일: styles/pages/legal.css
 */
export default function LegalToc({
  items,
}: {
  items: { id: string; title: string }[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 뷰포트 상단 20%~35% 밴드에 걸친 장을 "읽는 중"으로 판정한다.
        // 밴드가 좁아 여러 장이 동시에 걸리는 일이 드물고, 마지막 entry를 채택한다.
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="문서 목차">
      <h2 className="legal-toc__title">목차</h2>
      <ul className="legal-toc__list">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={`legal-toc__link${
                  active ? " legal-toc__link--active" : ""
                }`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
