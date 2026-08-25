"use client";

import Link from "next/link";
import { useMe } from "@/lib/use-me";
import { displayName } from "@/lib/user";

/**
 * 업체 대시보드 본문 — 인사말 + 업체 활동 3열 스트립 + 최근 활동 그룹 (개인 대시보드와 같은 카드 없는 컬럼 문법).
 * 수치는 게시판·예약 도메인 API 연동 전이라 0 고정(연동 시 실데이터로 교체).
 * 셸(MypageShell)이 세션을, biz/layout의 RoleGuard가 역할을 보장하므로 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css
 */
export default function BizDashboardContent() {
  const { me } = useMe();

  if (!me) return null;

  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">{displayName(me)}님의 업체 공간이에요.</h1>
      <p className="mypage-page__subtitle">내 서비스와 받은 요청 현황이에요.</p>

      {/* 거래 루프 기준 스탯 — 수치는 게시판·예약 도메인 연동 전 0 고정 */}
      <div className="mypage-stats">
        <Link href="/mypage/biz/services" className="mypage-stats__item">
          <span className="mypage-stats__label">내 서비스</span>
          <span className="mypage-stats__value">0</span>
        </Link>
        <Link href="/mypage/biz/received" className="mypage-stats__item">
          <span className="mypage-stats__label">받은 요청</span>
          <span className="mypage-stats__value">0</span>
        </Link>
        <div className="mypage-stats__item">
          <span className="mypage-stats__label">진행 중 거래</span>
          <span className="mypage-stats__value">0</span>
        </div>
      </div>

      <div className="mypage-settings">
        <section
          aria-labelledby="recent-activity-title"
          className="mypage-group"
        >
          <div className="mypage-group__header">
            <h2 id="recent-activity-title" className="mypage-group__title">
              최근 활동
            </h2>
          </div>
          <p className="mypage-group__note">
            아직 활동 내역이 없어요. 서비스를 등록하면 여기에 표시돼요.
          </p>
        </section>
      </div>
    </div>
  );
}
