import Link from "next/link";
import type { ReactNode } from "react";
import { AltArrowRightIcon } from "@/components/icons/SolarIcons";

/**
 * 대시보드·내 정보 공용 섹션 — 제목 헤딩 + 우측 슬롯("전체보기" 링크 또는 임의 액션) + 둥근 카드 셸.
 * variant: list(행 목록 — hairline이 좌우 패딩 안에서 흐름, 기본) / panel(폼·안내문 등 본문 — 사방 패딩).
 * titleId를 주면 aria-labelledby로 제목과 연결한다(없으면 aria-label).
 * 스타일: styles/pages/mypage.css(dash-section·dash-card)
 */
export default function DashSection({
  title,
  titleId,
  moreHref,
  moreLabel = "전체보기",
  action,
  variant = "list",
  children,
}: {
  title: string;
  titleId?: string;
  /** 있으면 헤딩 우측에 "전체보기" 링크 */
  moreHref?: string;
  moreLabel?: string;
  /** 헤딩 우측 임의 액션(텍스트 버튼 등) — moreHref보다 우선 */
  action?: ReactNode;
  variant?: "list" | "panel";
  children: ReactNode;
}) {
  return (
    <section
      className="dash-section"
      aria-label={titleId ? undefined : title}
      aria-labelledby={titleId}
    >
      <div className="dash-section__head">
        <h2 id={titleId} className="dash-section__title">
          {title}
        </h2>
        {action ? (
          <div className="dash-section__action">{action}</div>
        ) : moreHref ? (
          <Link href={moreHref} className="dash-section__more">
            {moreLabel}
            <AltArrowRightIcon size={16} />
          </Link>
        ) : null}
      </div>
      <div className={`dash-card dash-card--${variant}`}>{children}</div>
    </section>
  );
}
