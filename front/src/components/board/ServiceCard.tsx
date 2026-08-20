import Link from "next/link";
import { getCategoryLabel } from "@/lib/categories";
import { formatPriceFrom } from "@/lib/format";
import type { ServicePost } from "@/lib/mock/service-posts";

/**
 * "해드려요" 목록의 서비스 카드 (서버 컴포넌트).
 * 카드 클릭 시 업체 상세로 이동한다 — 서비스 상세 페이지 도입 시 링크 대상만 교체.
 * 스타일: styles/pages/board.css
 */
export default function ServiceCard({ post }: { post: ServicePost }) {
  return (
    <Link href={`/providers/${post.providerId}`} className="service-card">
      <article className="card card--interactive service-card__inner">
        <div className="service-card__head">
          <span className="pill">{getCategoryLabel(post.category)}</span>
          <span
            className="service-card__rating"
            aria-label={`평점 ${post.rating}점, 리뷰 ${post.reviewCount}개`}
          >
            <span aria-hidden="true" className="service-card__star">
              ★
            </span>
            <span className="service-card__rating-value">
              {post.rating.toFixed(1)}
            </span>
            <span className="service-card__review-count">
              ({post.reviewCount})
            </span>
          </span>
        </div>

        <div className="service-card__body">
          <h2 className="service-card__title">{post.title}</h2>
          <p className="service-card__meta">
            {post.providerName} · {post.region}
          </p>
        </div>

        <p className="service-card__desc">{post.description}</p>

        <p className="service-card__price">
          {formatPriceFrom(post.priceFrom)}
        </p>
      </article>
    </Link>
  );
}
