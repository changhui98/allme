"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AltArrowRightIcon,
  ChatRoundLineIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  ShopIcon,
  UserIcon,
} from "@/components/icons/SolarIcons";
import DashHero from "@/components/mypage/DashHero";
import DashQuickActions from "@/components/mypage/DashQuickActions";
import DashSection from "@/components/mypage/DashSection";
import MypageEmpty from "@/components/mypage/MypageEmpty";
import type { PageResponse } from "@/lib/admin";
import { getCategoryByCode } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { formatRegion } from "@/lib/regions";
import {
  SERVICE_REQUEST_STATUS_LABEL,
  fetchMyServiceRequests,
  type MyServiceRequestSummary,
} from "@/lib/service-requests";
import { fetchMyInquiries } from "@/lib/support";
import { useMe } from "@/lib/use-me";
import { displayName, hasRole } from "@/lib/user";

/**
 * 개인 대시보드 본문 — 인사말 + 그라데이션 요약 카드 + 아이콘 바로 가기 + 최근 내역 카드 (토스풍, 반응형 단일 레이아웃).
 * 요청 수·최근 행은 내 요청 목록 한 번(size 3)으로 겸하고, 문의 수는 size 1. 거래 수치는 예약 도메인 연동 전 0 고정.
 * 셸(MypageShell)이 세션을 보장하므로 me 유무만 가드하고, 조회 실패 시 조용히 0·빈 값으로 둔다.
 * 스타일: styles/pages/mypage.css(dash-*·mypage-crosslink)
 */
export default function DashboardContent() {
  const { me } = useMe();
  const [requests, setRequests] =
    useState<PageResponse<MyServiceRequestSummary> | null>(null);
  const [inquiryCount, setInquiryCount] = useState<number | null>(null);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    fetchMyServiceRequests({ page: 0, size: 3 })
      .then((page) => {
        if (!cancelled) setRequests(page);
      })
      .catch(() => {
        if (!cancelled)
          setRequests({ content: [], page: 0, size: 3, totalElements: 0, totalPages: 0 });
      });
    fetchMyInquiries({ page: 0, size: 1 })
      .then((page) => {
        if (!cancelled) setInquiryCount(page.totalElements);
      })
      .catch(() => {
        if (!cancelled) setInquiryCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [me]);

  if (!me) return null;

  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">{displayName(me)}님, 안녕하세요.</h1>
      <p className="mypage-page__subtitle">오늘의 거래 현황이에요.</p>

      {/* 거래 수치는 예약 도메인 연동 전 0 고정 */}
      <DashHero
        main={{
          label: "요청한 서비스",
          value: <>{requests?.totalElements ?? "–"}건</>,
          href: "/mypage/requests",
        }}
        subs={[
          { label: "진행 중 거래", value: "0건" },
          {
            label: "내 문의",
            value: <>{inquiryCount ?? "–"}건</>,
            href: "/mypage/inquiries",
          },
        ]}
      />

      <DashQuickActions
        actions={[
          {
            label: "요청 등록",
            href: "/mypage/requests/new",
            icon: <ClipboardCheckIcon size={22} />,
            tint: "sky",
          },
          {
            label: "요청한 서비스",
            href: "/mypage/requests",
            icon: <ClipboardListIcon size={22} />,
            tint: "violet",
          },
          {
            label: "내 문의",
            href: "/mypage/inquiries",
            icon: <ChatRoundLineIcon size={22} />,
            tint: "emerald",
          },
          {
            label: "내 정보",
            href: "/mypage/profile",
            icon: <UserIcon size={22} />,
            tint: "amber",
          },
        ]}
      />

      <DashSection title="최근 내역" moreHref="/mypage/requests">
        {requests === null ? (
          <p className="mypage-group__note">불러오는 중…</p>
        ) : requests.content.length === 0 ? (
          <MypageEmpty message="아직 요청한 서비스가 없어요." />
        ) : (
          <ul className="dash-recent">
            {requests.content.map((item) => (
              <li key={item.id} className="dash-recent__item">
                <Link href={`/mypage/requests/${item.id}`} className="dash-recent__link">
                  <span className="dash-recent__body">
                    <span className="dash-recent__title">{item.title}</span>
                    <span className="dash-recent__meta">
                      {getCategoryByCode(item.category).label} · {formatRegion(item.region)}{" "}
                      · {formatDate(item.createdDate)}
                    </span>
                  </span>
                  <span
                    className={`request-status request-status--${item.status.toLowerCase()}`}
                  >
                    {SERVICE_REQUEST_STATUS_LABEL[item.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashSection>

      {/* 업체 스탯은 개인 대시보드에 섞지 않고 업체 모드 안내 카드로만 연결한다 */}
      {hasRole(me, "PROVIDER") && (
        <div className="dash-section">
          <Link href="/mypage/biz" className="mypage-crosslink">
            <span className="mypage-crosslink__icon">
              <ShopIcon size={20} />
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
              <AltArrowRightIcon size={18} />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
