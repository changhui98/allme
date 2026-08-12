import Link from "next/link";

/**
 * 마무리 양방향 CTA — 수요자(해주세요)·공급자(업체 등록) 모두의 진입점 (서버 컴포넌트).
 * /business/register는 Footer와 동일한 placeholder 경로를 재사용한다.
 * 스타일: styles/pages/home.css
 */
export default function DualCtaSection() {
  return (
    <section aria-label="시작하기" className="dual-cta">
      <div className="card dual-cta__panel">
        <h2 className="dual-cta__title">원하는 서비스가 없나요?</h2>
        <p className="dual-cta__desc">
          해주세요 게시판에 필요한 작업을 올려보세요. 조건에 맞는 업체들이
          견적을 제안해 드려요.
        </p>
        <Link href="/requests" className="dual-cta__cta dual-cta__cta--primary">
          요청 올리러 가기
        </Link>
      </div>

      <div className="card dual-cta__panel">
        <h2 className="dual-cta__title">서비스를 제공하는 사장님이신가요?</h2>
        <p className="dual-cta__desc">
          무료로 업체를 등록하고 새 고객을 만나보세요. 정산까지 올미가
          깔끔하게 처리해 드립니다.
        </p>
        <Link
          href="/business/register"
          className="dual-cta__cta dual-cta__cta--secondary"
        >
          업체 등록하기
        </Link>
      </div>
    </section>
  );
}
