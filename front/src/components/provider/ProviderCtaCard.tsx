import { formatPriceFrom } from "@/lib/format";

/**
 * 업체 상세의 예약/문의 CTA (서버 컴포넌트).
 * 데스크톱은 우측 sticky 사이드바(--sidebar), 모바일은 하단 고정 바(--bottom-bar)로 렌더한다.
 * 예약·채팅 기능이 아직 없어 버튼은 비활성 상태로 두고 안내 문구를 붙인다.
 * 스타일: styles/pages/provider.css
 */
export default function ProviderCtaCard({
  priceFrom,
  responseRate,
  variant,
}: {
  /** 업체 보유 서비스 중 최저 시작가(원) */
  priceFrom: number;
  responseRate: number;
  variant: "sidebar" | "bottom-bar";
}) {
  const reserveButton = (
    <button
      type="button"
      disabled
      className="provider-cta__btn provider-cta__btn--primary"
    >
      예약 요청
    </button>
  );
  const chatButton = (
    <button
      type="button"
      disabled
      className="provider-cta__btn provider-cta__btn--secondary"
    >
      채팅 문의
    </button>
  );

  if (variant === "bottom-bar") {
    return (
      <div className="provider-cta provider-cta--bottom-bar">
        <div className="provider-cta__bar-row">
          <div>
            <p className="provider-cta__label">시작가</p>
            <p className="provider-cta__price">{formatPriceFrom(priceFrom)}</p>
          </div>
          <div className="provider-cta__bar-actions">
            {chatButton}
            {reserveButton}
          </div>
        </div>
        <p className="provider-cta__notice provider-cta__notice--bar">
          예약·채팅 기능은 오픈 준비 중이에요
        </p>
      </div>
    );
  }

  return (
    <aside className="provider-cta provider-cta--sidebar">
      <p className="provider-cta__label">시작가</p>
      <p className="provider-cta__price provider-cta__price--lg">
        {formatPriceFrom(priceFrom)}
      </p>
      <div className="provider-cta__side-actions">
        {reserveButton}
        {chatButton}
      </div>
      <p className="provider-cta__notice provider-cta__notice--side">
        예약·채팅 기능은 오픈 준비 중이에요
      </p>
      <p className="provider-cta__response">
        평균 응답률{" "}
        <span className="provider-cta__response-rate">{responseRate}%</span> ·
        빠르게 답변드려요
      </p>
    </aside>
  );
}
