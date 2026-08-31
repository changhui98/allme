import type { Metadata } from "next";
import { Suspense } from "react";
import AdBannerCarousel from "@/components/board/AdBannerCarousel";
import CategoryTabs from "@/components/board/CategoryTabs";
import ServiceBoardList from "@/components/board/ServiceBoardList";
import { isCategoryId } from "@/lib/categories";
import { getAdBanners } from "@/lib/mock/ad-banners";

export const metadata: Metadata = {
  title: "해드려요",
  description:
    "청소, 인테리어, 페인트·도장, 웹·디자인 제작 — 검증된 업체들의 서비스를 둘러보고 예약하세요.",
};

/**
 * 해드려요 — 업체가 등록한 서비스 목록(공개 API).
 * 카테고리 필터(?category=)·검색어(?q=)는 URL로 표현하고, 목록 자체는 클라이언트에서 불러온다
 * (해주세요와 같은 패턴 — 서버 fetch는 컨테이너 내부 API URL 설정이 필요해 후속).
 * 스타일: styles/pages/board.css
 */
export default async function ServicesPage({
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
      <h1 className="board-page__title">해드려요</h1>
      <p className="board-page__subtitle">
        업체들이 등록한 서비스를 둘러보고 마음에 드는 곳에 예약을 요청하세요.
      </p>

      <div className="board-page__section">
        <AdBannerCarousel banners={getAdBanners()} />
      </div>

      <div className="board-page__section">
        <CategoryTabs basePath="/services" active={active} />
      </div>

      <Suspense fallback={<p className="board-page__empty">불러오는 중…</p>}>
        <ServiceBoardList />
      </Suspense>
    </main>
  );
}
