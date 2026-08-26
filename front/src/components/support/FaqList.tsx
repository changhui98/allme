"use client";

import { useEffect, useState } from "react";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABEL,
  fetchFaqs,
  type Faq,
  type FaqCategory,
} from "@/lib/support";

/**
 * FAQ — 분류 탭(항목이 있는 분류만) + details/summary 아코디언(무JS).
 * "전체"에서는 분류별 소제목으로 묶어 보여준다. 스타일: styles/pages/support.css (탭은 board.css category-tabs)
 */
export default function FaqList() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<FaqCategory | "">("");

  useEffect(() => {
    let cancelled = false;
    fetchFaqs()
      .then((data) => {
        if (!cancelled) setFaqs(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="board-page__empty">{error}</p>;
  if (!faqs) return <p className="board-page__empty">불러오는 중…</p>;
  if (faqs.length === 0) {
    return <p className="board-page__empty">아직 등록된 질문이 없어요.</p>;
  }

  const categories = FAQ_CATEGORIES.filter((c) => faqs.some((f) => f.category === c));
  const tabs: { value: FaqCategory | ""; label: string }[] = [
    { value: "", label: "전체" },
    ...categories.map((c) => ({ value: c, label: FAQ_CATEGORY_LABEL[c] })),
  ];
  const groups = (active ? [active] : categories).map((c) => ({
    category: c,
    items: faqs.filter((f) => f.category === c),
  }));

  return (
    <>
      <nav aria-label="FAQ 분류" className="board-page__section category-tabs">
        <ul className="category-tabs__list">
          {tabs.map((tab) => (
            <li key={tab.value} className="category-tabs__item">
              <button
                type="button"
                onClick={() => setActive(tab.value)}
                aria-current={active === tab.value ? "true" : undefined}
                className={`category-tabs__tab${
                  active === tab.value ? " category-tabs__tab--active" : ""
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {groups.map((group) => (
        <section key={group.category} aria-label={FAQ_CATEGORY_LABEL[group.category]}>
          {!active && (
            <h2 className="faq-group__title">{FAQ_CATEGORY_LABEL[group.category]}</h2>
          )}
          <ul className="faq-list">
            {group.items.map((faq) => (
              <li key={faq.id}>
                <details className="faq-item">
                  <summary className="faq-item__summary">
                    <span className="faq-item__q" aria-hidden="true">
                      Q
                    </span>
                    <span className="faq-item__question">{faq.question}</span>
                    <svg
                      className="faq-item__chevron"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M19 9l-7 6-7-6" />
                    </svg>
                  </summary>
                  <div className="faq-item__answer">{faq.answer}</div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
