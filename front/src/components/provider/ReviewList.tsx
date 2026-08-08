"use client";

import { useState } from "react";
import type { ProviderReview } from "@/lib/mock/providers";

/** 접힌 상태에서 보여줄 리뷰 개수 */
const INITIAL_VISIBLE = 3;

/**
 * 업체 상세의 리뷰 목록. 데이터는 서버 페이지가 주입하고 표시만 담당한다.
 * "모두 보기" 토글 때문에 이 컴포넌트만 클라이언트로 둔다.
 */
export default function ReviewList({
  reviews,
  totalCount,
}: {
  reviews: ProviderReview[];
  /** 업체의 총 리뷰 수 — reviews는 최근 리뷰만 담으므로 별도로 받는다 */
  totalCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_VISIBLE);

  return (
    <div>
      <ul className="divide-y divide-stone-200 dark:divide-stone-800">
        {visible.map((review) => (
          <li key={review.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                aria-label={`평점 ${review.rating}점`}
                className="text-sm text-amber-500"
              >
                <span aria-hidden="true">
                  {"★".repeat(review.rating)}
                  <span className="text-stone-300 dark:text-stone-700">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </span>
              </span>
              <span className="text-sm font-medium">{review.authorMasked}</span>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {review.date}
              </span>
            </div>
            {review.serviceTitle && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {review.serviceTitle}
              </p>
            )}
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {review.content}
            </p>
          </li>
        ))}
      </ul>

      {!expanded && reviews.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 w-full rounded-lg border border-stone-300 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800/60"
        >
          리뷰 {totalCount}개 모두 보기
        </button>
      )}
    </div>
  );
}
