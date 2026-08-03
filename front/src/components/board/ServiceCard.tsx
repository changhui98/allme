import { getCategoryLabel } from "@/lib/categories";
import type { ServicePost } from "@/lib/mock/service-posts";

/** 시작가(원)를 "15만원~" 형태로 포맷한다. 만원 미만 단위는 천 단위 콤마로 표기. */
function formatPriceFrom(price: number): string {
  if (price >= 10_000 && price % 10_000 === 0) {
    return `${(price / 10_000).toLocaleString("ko-KR")}만원~`;
  }
  return `${price.toLocaleString("ko-KR")}원~`;
}

/**
 * "해드려요" 목록의 서비스 카드 (서버 컴포넌트).
 * 상세 페이지가 아직 없어 링크 없이 정보만 렌더한다.
 */
export default function ServiceCard({ post }: { post: ServicePost }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-stone-200 p-5 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
          {getCategoryLabel(post.category)}
        </span>
        <span
          className="flex items-center gap-1 text-sm text-stone-600 dark:text-zinc-300"
          aria-label={`평점 ${post.rating}점, 리뷰 ${post.reviewCount}개`}
        >
          <span aria-hidden="true" className="text-amber-500">
            ★
          </span>
          <span className="font-medium">{post.rating.toFixed(1)}</span>
          <span className="text-stone-400 dark:text-zinc-500">
            ({post.reviewCount})
          </span>
        </span>
      </div>

      <div>
        <h2 className="font-semibold leading-snug">{post.title}</h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
          {post.providerName} · {post.region}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
        {post.description}
      </p>

      <p className="mt-auto text-base font-bold">
        {formatPriceFrom(post.priceFrom)}
      </p>
    </article>
  );
}
