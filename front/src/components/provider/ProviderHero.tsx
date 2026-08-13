import { getCategoryLabel } from "@/lib/categories";
import type { Provider } from "@/lib/mock/providers";

/**
 * 업체 상세 상단의 프로필 히어로 (서버 컴포넌트).
 * 아바타·상호·인증 뱃지·카테고리·평점과 신뢰 지표 3종을 보여준다.
 * 프로필 이미지는 스토리지 도입 전까지 그라데이션 + 이니셜로 대체한다.
 * 스타일: styles/pages/provider.css (필/뱃지는 공용 .pill·.badge--verified)
 */
export default function ProviderHero({ provider }: { provider: Provider }) {
  return (
    <section>
      <div className="provider-hero__head">
        <div
          aria-hidden="true"
          className={`provider-hero__avatar ${provider.avatarClass}`}
        >
          {provider.name.charAt(0)}
        </div>

        <div className="provider-hero__body">
          <div className="provider-hero__name-row">
            <h1 className="provider-hero__name">{provider.name}</h1>
            {provider.verified && (
              <span
                className="badge--verified provider-hero__verified"
                aria-label={`사업자 인증 완료 (사업자등록번호 ${provider.businessRegistrationMasked})`}
                title={`사업자등록번호 ${provider.businessRegistrationMasked}`}
              >
                <svg
                  aria-hidden="true"
                  className="provider-hero__verified-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z"
                    clipRule="evenodd"
                  />
                </svg>
                사업자 인증
              </span>
            )}
          </div>

          <p className="provider-hero__tagline">{provider.tagline}</p>

          <div className="provider-hero__meta">
            {provider.categories.map((category) => (
              <span key={category} className="pill">
                {getCategoryLabel(category)}
              </span>
            ))}
            <span className="provider-hero__region">{provider.region}</span>
            <span
              className="provider-hero__rating"
              aria-label={`평점 ${provider.rating}점, 리뷰 ${provider.reviewCount}개`}
            >
              <span aria-hidden="true" className="provider-hero__star">
                ★
              </span>
              <span className="provider-hero__rating-value">
                {provider.rating.toFixed(1)}
              </span>
              <span className="provider-hero__review-count">
                ({provider.reviewCount})
              </span>
            </span>
          </div>
        </div>
      </div>

      <dl className="provider-hero__stats">
        <div>
          <dt className="provider-hero__stat-label">응답률</dt>
          <dd className="provider-hero__stat-value">
            {provider.responseRate}%
          </dd>
        </div>
        <div>
          <dt className="provider-hero__stat-label">경력</dt>
          <dd className="provider-hero__stat-value">
            {provider.careerYears}년
          </dd>
        </div>
        <div>
          <dt className="provider-hero__stat-label">거래 완료</dt>
          <dd className="provider-hero__stat-value">
            {provider.completedCount.toLocaleString("ko-KR")}건
          </dd>
        </div>
      </dl>
    </section>
  );
}
