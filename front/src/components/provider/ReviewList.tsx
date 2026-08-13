"use client";

import { useState } from "react";
import type { ProviderReview } from "@/lib/mock/providers";

/** 접힌 상태에서 보여줄 리뷰 개수 */
const INITIAL_VISIBLE = 3;

/**
 * 업체 상세의 리뷰 목록. 데이터는 서버 페이지가 주입하고 표시만 담당한다.
 * "모두 보기" 토글 때문에 이 컴포넌트만 클라이언트로 둔다.
 * 스타일: styles/pages/provider.css
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
    <div className="review-list">
      <ul className="review-list__items">
        {visible.map((review) => (
          <li key={review.id} className="review-list__item">
            <div className="review-list__meta">
              <span
                aria-label={`평점 ${review.rating}점`}
                className="review-list__stars"
              >
                <span aria-hidden="true">
                  {"★".repeat(review.rating)}
                  <span className="review-list__stars-empty">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </span>
              </span>
              <span className="review-list__author">{review.authorMasked}</span>
              <span className="review-list__date">{review.date}</span>
            </div>
            {review.serviceTitle && (
              <p className="review-list__service">{review.serviceTitle}</p>
            )}
            <p className="review-list__content">{review.content}</p>
          </li>
        ))}
      </ul>

      {!expanded && reviews.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="review-list__more"
        >
          리뷰 {totalCount}개 모두 보기
        </button>
      )}
    </div>
  );
}
