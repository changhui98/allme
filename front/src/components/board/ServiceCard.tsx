import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { getCategoryByCode } from "@/lib/categories";
import {
  formatListingPrice,
  formatRegions,
  type OpenServiceListingSummary,
} from "@/lib/provider-services";

/**
 * "해드려요" 목록의 서비스 카드 — 공개 서비스 API 행을 그린다.
 * 카드 클릭 시 업체 상세로 이동한다 — 서비스 상세 페이지 도입 시 링크 대상만 교체.
 * 평점·리뷰는 리뷰 도메인 구현 전이라 자리 대신 소요 기간을 보여준다(CSS의 rating 블록은 유지).
 * 스타일: styles/pages/board.css
 */
export default function ServiceCard({ post }: { post: OpenServiceListingSummary }) {
  return (
    <Link href={`/providers/${post.providerUserId}`} className="service-card">
      <article className="card card--interactive service-card__inner">
        {post.thumbnailUrl && (
          /* 백엔드 정적 서빙 이미지라 next/image 최적화 대상이 아님 */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`${API_BASE_URL}${post.thumbnailUrl}`}
            alt=""
            className="service-card__thumb"
          />
        )}
        <div className="service-card__head">
          <span className="pill">{getCategoryByCode(post.category).label}</span>
          {post.duration && (
            <span className="service-card__duration">소요 {post.duration}</span>
          )}
        </div>

        <div className="service-card__body">
          <h2 className="service-card__title">{post.title}</h2>
          <p className="service-card__meta">
            {post.providerName ?? "업체"} · {formatRegions(post.regions)}
          </p>
        </div>

        <p className="service-card__desc">{post.summary}</p>

        <p className="service-card__price">
          {formatListingPrice(post.priceFrom, post.priceNegotiable)}
        </p>
      </article>
    </Link>
  );
}
