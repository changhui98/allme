import Link from "next/link";

/**
 * 마이페이지 목록 빈 상태 — 게시판 도메인 API 연동 전 안내(연동 시 목록으로 교체).
 * 스타일: styles/pages/mypage.css
 */
export default function MypageEmpty({
  message,
  ctaLabel,
  ctaHref,
}: {
  message: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="mypage-empty">
      <p className="mypage-empty__message">{message}</p>
      <Link href={ctaHref} className="mypage-empty__cta">
        {ctaLabel}
      </Link>
    </div>
  );
}
