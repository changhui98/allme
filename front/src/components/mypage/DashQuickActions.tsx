import Link from "next/link";
import type { ReactNode } from "react";

export type DashQuickAction = {
  label: string;
  href: string;
  icon: ReactNode;
  /** 아이콘 타일 틴트 — 팔레트 변수 기반이라 다크 모드 자동 대응 */
  tint: "sky" | "violet" | "emerald" | "amber";
};

/**
 * 대시보드 아이콘 바로 가기 4열 카드 (개인·업체 공용).
 * 스타일: styles/pages/mypage.css(dash-actions·dash-card)
 */
export default function DashQuickActions({ actions }: { actions: DashQuickAction[] }) {
  return (
    <nav className="dash-card dash-actions" aria-label="바로 가기">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`dash-actions__item dash-actions__item--${action.tint}`}
        >
          <span className="dash-actions__icon">{action.icon}</span>
          <span className="dash-actions__label">{action.label}</span>
        </Link>
      ))}
    </nav>
  );
}
