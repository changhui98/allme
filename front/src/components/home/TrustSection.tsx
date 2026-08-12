/**
 * 신뢰 요소 3종 — 에스크로 안전결제 / 사업자 인증 / 실거래 리뷰 (서버 컴포넌트).
 * 색은 기존 의미론을 따른다: primary(브랜드), emerald(인증 뱃지), amber(별점).
 * 스타일: styles/pages/home.css
 */
export default function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="trust">
      <h2 id="trust-heading" className="trust__heading">
        올미가 거래를 지켜요
      </h2>

      <ul className="trust__list">
        <li className="card trust__card">
          <span className="trust__icon trust__icon--primary">
            <ShieldIcon />
          </span>
          <h3 className="trust__title">에스크로 안전결제</h3>
          <p className="trust__desc">
            결제금은 올미가 보관하고, 작업 완료를 확인한 뒤에만 업체에
            정산합니다. 먹튀·분쟁 걱정 없이 거래하세요.
          </p>
        </li>

        <li className="card trust__card">
          <span className="trust__icon trust__icon--emerald">
            <BadgeCheckIcon />
          </span>
          <h3 className="trust__title">사업자 인증</h3>
          <p className="trust__desc">
            국세청 사업자등록 진위확인을 통과한 업체에만 인증 마크를
            드립니다. 검증된 업체와 만나세요.
          </p>
        </li>

        <li className="card trust__card">
          <span className="trust__icon trust__icon--amber">
            <StarIcon />
          </span>
          <h3 className="trust__title">실거래 리뷰</h3>
          <p className="trust__desc">
            올미에서 실제로 거래를 마친 사용자만 리뷰를 남길 수 있어요.
            부풀려진 후기 없이 있는 그대로.
          </p>
        </li>
      </ul>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function BadgeCheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9L12 3.5z" />
    </svg>
  );
}
