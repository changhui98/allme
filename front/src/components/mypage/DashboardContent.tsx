"use client";

import Link from "next/link";
import { useMe } from "@/lib/use-me";

/**
 * 대시보드 본문 — 인사말 + 거래 현황 스탯 로우 + 최근 활동.
 * 수치는 게시판·예약 도메인 API 연동 전이라 0 고정(연동 시 실데이터로 교체).
 * 카드/박스 없이 여백·타이포·hairline 구분선으로만 구성한다.
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

      <div className="mypage-stats">
        <Link href="/mypage/requests" className="mypage-stats__item">
          <span className="mypage-stats__label">요청한 서비스</span>
          <span className="mypage-stats__value">0</span>
        </Link>
        <Link href="/mypage/received" className="mypage-stats__item">
          <span className="mypage-stats__label">받은 요청</span>
          <span className="mypage-stats__value">0</span>
        </Link>
      </div>

      <section aria-label="최근 활동" className="mypage-section">
        <h2 className="mypage-section__title">최근 활동</h2>
        <p className="mypage-section__empty">
          아직 활동 내역이 없어요. 거래를 시작하면 여기에 표시돼요.
        </p>
      </section>
    </>
  );
}
