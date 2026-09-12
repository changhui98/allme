import Link from "next/link";
import type { ReactNode } from "react";
import { AltArrowRightIcon } from "@/components/icons/SolarIcons";

export type DashHeroStat = {
  label: string;
  value: ReactNode;
  /** 있으면 스탯 전체가 링크가 된다 */
  href?: string;
};

/**
 * 대시보드 그라데이션 요약 카드 — 큰 스탯 + hairline 구분선 + 서브 스탯 2열 (개인·업체 공용).
 * 그라데이션·글자색은 악센트 토큰을 따르므로(--primary/--primary-foreground) 테마 전환에 자동 대응한다.
 * 스타일: styles/pages/mypage.css(dash-hero)
 */
export default function DashHero({
  main,
  subs,
}: {
  main: DashHeroStat;
  subs: DashHeroStat[];
}) {
  const mainContent = (
    <>
      <span className="dash-hero__label">{main.label}</span>
      <span className="dash-hero__value">
        {main.value}
        {main.href && <AltArrowRightIcon size={20} className="dash-hero__chevron" />}
      </span>
    </>
  );

  return (
    <section className="dash-hero" aria-label="활동 요약">
      {main.href ? (
        <Link href={main.href} className="dash-hero__main">
          {mainContent}
        </Link>
      ) : (
        <div className="dash-hero__main">{mainContent}</div>
      )}

      <div className="dash-hero__divider" aria-hidden="true" />

      <div className="dash-hero__subs">
        {subs.map((sub) => {
          const content = (
            <>
              <span className="dash-hero__sub-label">{sub.label}</span>
              <span className="dash-hero__sub-value">{sub.value}</span>
            </>
          );
          return sub.href ? (
            <Link key={sub.label} href={sub.href} className="dash-hero__sub">
              {content}
            </Link>
          ) : (
            <div key={sub.label} className="dash-hero__sub">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
