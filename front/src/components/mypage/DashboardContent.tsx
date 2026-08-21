"use client";

import Link from "next/link";
import { useMe } from "@/lib/use-me";
import { hasRole } from "@/lib/user";

/**
 * 대시보드 본문 — 인사말 + 거래 현황 스탯 카드 + 최근 활동 (A안: 경계선 카드, 그림자 없음).
 * 수치는 게시판·예약 도메인 API 연동 전이라 0 고정(연동 시 실데이터로 교체).
 * 셸(MypageShell)이 세션을 보장하므로 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css
 */
export default function DashboardContent() {
  const { me } = useMe();

  if (!me) return null;

  return (
    <>
      <h1 className="mypage-page__title">{me.name}님, 안녕하세요.</h1>
      <p className="mypage-page__subtitle">오늘의 거래 현황이에요.</p>

      {/* 거래 루프 기준 스탯 — 수치는 게시판·예약 도메인 연동 전 0 고정 */}
      <div className="mypage-stats">
        <Link href="/mypage/requests" className="mypage-stats__item">
          <span className="mypage-stats__icon mypage-stats__icon--brand">
            <ListIcon />
          </span>
          <span className="mypage-stats__label">요청한 서비스</span>
          <span className="mypage-stats__value">0</span>
        </Link>
        <div className="mypage-stats__item">
          <span className="mypage-stats__icon">
            <ClockIcon />
          </span>
          <span className="mypage-stats__label">진행 중 거래</span>
          <span className="mypage-stats__value">0</span>
        </div>
        <div className="mypage-stats__item">
          <span className="mypage-stats__icon mypage-stats__icon--success">
            <CheckIcon />
          </span>
          <span className="mypage-stats__label">완료된 거래</span>
          <span className="mypage-stats__value">0</span>
        </div>
      </div>

      <section aria-label="최근 활동" className="mypage-section">
        <h2 className="mypage-section__title">최근 활동</h2>
        <p className="mypage-section__empty">
          아직 활동 내역이 없어요. 거래를 시작하면 여기에 표시돼요.
        </p>
      </section>

      {/* 업체 스탯은 개인 대시보드에 섞지 않고 업체 모드 배너로 안내만 한다 */}
      {hasRole(me, "PROVIDER") && (
        <Link href="/mypage/biz" className="mypage-crosslink">
          <span className="mypage-crosslink__icon">
            <StoreIcon />
          </span>
          <span className="mypage-crosslink__body">
            <span className="mypage-crosslink__title">
              업체 활동은 업체 모드에서 관리해요
            </span>
            <span className="mypage-crosslink__sub">
              내 서비스 · 받은 요청 · 업체 정보
            </span>
          </span>
          <span className="mypage-crosslink__chevron">
            <ChevronIcon />
          </span>
        </Link>
      )}
    </>
  );
}

function ListIcon() {
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
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
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

function CheckIcon() {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg
      width="20"
      height="20"
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

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
