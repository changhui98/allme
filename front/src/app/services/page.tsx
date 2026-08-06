import type { Metadata } from "next";
import AdBannerCarousel from "@/components/board/AdBannerCarousel";
import CategoryTabs from "@/components/board/CategoryTabs";
import ServiceCard from "@/components/board/ServiceCard";
import { isCategoryId } from "@/lib/categories";
import { getAdBanners } from "@/lib/mock/ad-banners";
import { getServicePosts } from "@/lib/mock/service-posts";

export const metadata: Metadata = {
  title: "해드려요 | 올미",
  description:
    "청소, 인테리어, 페인트·도장, 웹·디자인 제작 — 검증된 업체들의 서비스를 둘러보고 예약하세요.",
};

/**
 * 해드려요 — 업체가 등록한 서비스 목록.
 * 카테고리 필터(?category=)와 검색어(?q=)를 쿼리로 표현하고 서버에서 필터링해 SSR한다.
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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">해드려요</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
        업체들이 등록한 서비스를 둘러보고 마음에 드는 곳에 예약을 요청하세요.
      </p>

      <div className="mt-6">
        <AdBannerCarousel banners={getAdBanners()} />
      </div>

      <div className="mt-6">
        <CategoryTabs basePath="/services" active={active} />
      </div>

      {query && (
        <p className="mt-6 text-sm text-stone-500 dark:text-zinc-400">
          <span className="font-semibold text-stone-700 dark:text-zinc-200">
            &lsquo;{query}&rsquo;
          </span>{" "}
          검색 결과 {posts.length}건
        </p>
      )}

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-stone-500 dark:text-zinc-400">
          {query
            ? "검색 결과가 없어요. 다른 검색어로 시도해 보세요."
            : "이 카테고리에 등록된 서비스가 아직 없어요."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
