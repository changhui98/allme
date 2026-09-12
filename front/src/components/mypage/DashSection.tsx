import Link from "next/link";
import type { ReactNode } from "react";
import { AltArrowRightIcon } from "@/components/icons/SolarIcons";

/**
 * 대시보드 섹션 — 제목 + "전체보기" 링크 헤딩과 목록 카드 셸 (개인·업체 공용).
 * 스타일: styles/pages/mypage.css(dash-section·dash-card)
 */
export default function DashSection({
  title,
  moreHref,
  children,
}: {
  title: string;
  moreHref: string;
  children: ReactNode;
}) {
  return (
    <section className="dash-section" aria-label={title}>
      <div className="dash-section__head">
        <h2 className="dash-section__title">{title}</h2>
        <Link href={moreHref} className="dash-section__more">
          전체보기
          <AltArrowRightIcon size={16} />
        </Link>
      </div>
      <div className="dash-card dash-card--list">{children}</div>
    </section>
  );
}
