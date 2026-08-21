"use client";

import Link from "next/link";
import { useMe } from "@/lib/use-me";

/**
 * 업체 대시보드 본문 — 인사말 + 업체 활동 스탯 카드 + 최근 활동 (A안: 경계선 카드, 그림자 없음).
 * 수치는 게시판·예약 도메인 API 연동 전이라 0 고정(연동 시 실데이터로 교체).
 * 셸(MypageShell)이 세션을, biz/layout의 RoleGuard가 역할을 보장하므로 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css
 */
export default function BizDashboardContent() {
  const { me } = useMe();

  if (!me) return null;

  return (
    <>
      <h1 className="mypage-page__title">{me.name}님의 업체 공간이에요.</h1>
      <p className="mypage-page__subtitle">내 서비스와 받은 요청 현황이에요.</p>

      {/* 거래 루프 기준 스탯 — 수치는 게시판·예약 도메인 연동 전 0 고정 */}
      <div className="mypage-stats">
        <Link href="/mypage/biz/services" className="mypage-stats__item">
          <span className="mypage-stats__icon mypage-stats__icon--brand">
            <StoreIcon />
          </span>
          <span className="mypage-stats__label">내 서비스</span>
          <span className="mypage-stats__value">0</span>
        </Link>
        <Link href="/mypage/biz/received" className="mypage-stats__item">
          <span className="mypage-stats__icon mypage-stats__icon--brand">
            <InboxIcon />
          </span>
          <span className="mypage-stats__label">받은 요청</span>
          <span className="mypage-stats__value">0</span>
        </Link>
        <div className="mypage-stats__item">
          <span className="mypage-stats__icon">
            <ClockIcon />
          </span>
          <span className="mypage-stats__label">진행 중 거래</span>
          <span className="mypage-stats__value">0</span>
        </div>
      </div>

      <section aria-label="최근 활동" className="mypage-section">
        <h2 className="mypage-section__title">최근 활동</h2>
        <p className="mypage-section__empty">
          아직 활동 내역이 없어요. 서비스를 등록하면 여기에 표시돼요.
        </p>
      </section>
    </>
  );
}

function StoreIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M5 11v9h14v-9" />
      <path d="M9.5 20v-5.5h5V20" />
      <path d="M4 9.5h16" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6L18.5 5a2 2 0 0 0-1.8-1H7.3a2 2 0 0 0-1.8 1Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
