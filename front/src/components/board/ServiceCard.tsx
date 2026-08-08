import Link from "next/link";
import { getCategoryLabel } from "@/lib/categories";
import { formatPriceFrom } from "@/lib/format";
import type { ServicePost } from "@/lib/mock/service-posts";

/**
 * "해드려요" 목록의 서비스 카드 (서버 컴포넌트).
 * 카드 클릭 시 업체 상세로 이동한다 — 서비스 상세 페이지 도입 시 링크 대상만 교체.
 */
export default function ServiceCard({ post }: { post: ServicePost }) {
  return (
    <Link href={`/providers/${post.providerId}`} className="block h-full">
      <article className="flex h-full flex-col gap-3 rounded-lg border border-stone-200 p-5 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:hover:border-stone-700 dark:hover:bg-stone-800/60">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {getCategoryLabel(post.category)}
          </span>
          <span
            className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-300"
            aria-label={`평점 ${post.rating}점, 리뷰 ${post.reviewCount}개`}
          >
            <span aria-hidden="true" className="text-amber-500">
              ★
            </span>
            <span className="font-medium">{post.rating.toFixed(1)}</span>
            <span className="text-stone-400 dark:text-stone-500">
              ({post.reviewCount})
            </span>
          </span>
        </div>

        <div>
          <h2 className="font-semibold leading-snug">{post.title}</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {post.providerName} · {post.region}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {post.description}
        </p>

        <p className="mt-auto text-base font-bold">
          {formatPriceFrom(post.priceFrom)}
        </p>
      </article>
    </Link>
  );
}
