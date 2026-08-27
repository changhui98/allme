import Link from "next/link";

/**
 * 마이페이지 목록 빈 상태 — 안내 문구 + 선택적 CTA 버튼(그룹 헤더에 같은 동선 버튼이 있으면 생략).
 * 스타일: styles/pages/mypage.css
 */
export default function MypageEmpty({
  message,
  ctaLabel,
  ctaHref,
}: {
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="mypage-empty">
      <p className="mypage-empty__message">{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="mypage-empty__cta">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
