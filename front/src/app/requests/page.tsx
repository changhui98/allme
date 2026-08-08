import type { Metadata } from "next";
import CategoryTabs from "@/components/board/CategoryTabs";
import RequestCard from "@/components/board/RequestCard";
import { isCategoryId } from "@/lib/categories";
import { getRequestPosts } from "@/lib/mock/request-posts";

export const metadata: Metadata = {
  title: "해주세요 | 올미",
  description:
    "필요한 서비스를 요청 글로 올려보세요. 청소, 인테리어, 페인트·도장, 웹·디자인 제작 업체들이 제안을 보냅니다.",
};

/**
 * 해주세요 — 사용자가 올린 요청 글 목록. 업체가 둘러보고 제안한다.
 * 카테고리 필터는 ?category= 쿼리로 표현하고 서버에서 필터링해 SSR한다.
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
  const posts = getRequestPosts(active);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">해주세요</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        필요한 일을 올려두면 업체들이 확인하고 제안을 보내드려요.
      </p>

      <div className="mt-6">
        <CategoryTabs basePath="/requests" active={active} />
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-stone-500 dark:text-stone-400">
          이 카테고리에 올라온 요청이 아직 없어요.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <RequestCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
