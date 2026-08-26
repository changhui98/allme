import type { ReactNode } from "react";

/**
 * 고객지원 페이지(공지사항·FAQ·1:1 문의) 공통 헤딩 — 가운데 정렬 큰 제목 + 부제.
 * board-page__title/__subtitle 위에 support-page__* 로 크기·정렬만 얹는다. 스타일: styles/pages/support.css
 */
export default function SupportPageHead({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <header className="support-page__head">
      <h1 className="board-page__title support-page__title">{title}</h1>
      {description && <p className="board-page__subtitle">{description}</p>}
    </header>
  );
}
