import type { Metadata } from "next";
import { Suspense } from "react";
import CategoryTabs from "@/components/board/CategoryTabs";
import RequestBoardList from "@/components/board/RequestBoardList";
import { isCategoryId } from "@/lib/categories";

export const metadata: Metadata = {
  title: "해주세요",
  description:
    "필요한 서비스를 요청 글로 올려보세요. 청소, 인테리어, 페인트·도장, 웹·디자인 제작 업체들이 제안을 보냅니다.",
};

/**
 * 해주세요 — 사용자가 올린 요청 글 목록(공개 API). 업체가 둘러보고 제안한다.
 * 카테고리 필터는 ?category=(슬러그) 쿼리로 표현한다(탭은 링크). 목록 자체는 클라이언트에서 불러온다
 * (공지 목록과 같은 패턴 — 서버 fetch는 컨테이너 내부 API URL 설정이 필요해 후속).
 * 스타일: styles/pages/board.css
 */
export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  // 무효한 값(배열 포함)은 "전체"로 폴백한다.
  const active =
    typeof category === "string" && isCategoryId(category)
      ? category
      : undefined;

  return (
    <main className="page-container board-page">
      <h1 className="board-page__title">해주세요</h1>
      <p className="board-page__subtitle">
        필요한 일을 올려두면 업체들이 확인하고 제안을 보내드려요.
      </p>

      <div className="board-page__section">
        <CategoryTabs basePath="/requests" active={active} />
      </div>

      <Suspense fallback={<p className="board-page__empty">불러오는 중…</p>}>
        <RequestBoardList />
      </Suspense>
    </main>
  );
}
