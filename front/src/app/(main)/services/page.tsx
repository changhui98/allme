import type { Metadata } from "next";
import AdBannerCarousel from "@/components/board/AdBannerCarousel";
import CategoryTabs from "@/components/board/CategoryTabs";
import ServiceCard from "@/components/board/ServiceCard";
import { isCategoryId } from "@/lib/categories";
import { getAdBanners } from "@/lib/mock/ad-banners";
import { getServicePosts } from "@/lib/mock/service-posts";

export const metadata: Metadata = {
  title: "해드려요",
  description:
    "청소, 인테리어, 페인트·도장, 웹·디자인 제작 — 검증된 업체들의 서비스를 둘러보고 예약하세요.",
};

/**
 * 해드려요 — 업체가 등록한 서비스 목록.
 * 카테고리 필터(?category=)와 검색어(?q=)를 쿼리로 표현하고 서버에서 필터링해 SSR한다.
 * 스타일: styles/pages/board.css
 */
export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
}) {
  const { category, q } = await searchParams;
  // 무효한 값(배열 포함)은 "전체"로 폴백한다.
  const active =
    typeof category === "string" && isCategoryId(category)
      ? category
      : undefined;
  const query = typeof q === "string" ? q.trim() : undefined;
  const posts = getServicePosts(active, query);

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

      {query && (
        <p className="board-page__result-line">
          <span className="board-page__result-query">
            &lsquo;{query}&rsquo;
          </span>{" "}
          검색 결과 {posts.length}건
        </p>
      )}

      {posts.length === 0 ? (
        <p className="board-page__empty">
          {query
            ? "검색 결과가 없어요. 다른 검색어로 시도해 보세요."
            : "이 카테고리에 등록된 서비스가 아직 없어요."}
        </p>
      ) : (
        <ul className="card-grid">
          {posts.map((post) => (
            <li key={post.id}>
              <ServiceCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
