"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BuildingsIcon,
  CaseIcon,
  ClipboardCheckIcon,
  InboxIcon,
} from "@/components/icons/SolarIcons";
import DashHero from "@/components/mypage/DashHero";
import DashQuickActions from "@/components/mypage/DashQuickActions";
import DashSection from "@/components/mypage/DashSection";
import MypageEmpty from "@/components/mypage/MypageEmpty";
import type { PageResponse } from "@/lib/admin";
import { getCategoryByCode } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import {
  PROPOSAL_STATUS_LABEL,
  fetchMyProposals,
  type MyProposal,
} from "@/lib/proposals";
import { fetchMyServiceListings } from "@/lib/provider-services";
import { formatWon } from "@/lib/service-requests";
import { useMe } from "@/lib/use-me";
import { displayName } from "@/lib/user";

/**
 * 업체 대시보드 본문 — 인사말 + 그라데이션 요약 카드 + 아이콘 바로 가기 + 최근 내역 카드 (개인 대시보드와 같은 문법).
 * 제안 수·최근 행은 보낸 제안 목록 한 번(size 3)으로 겸하고, 내 서비스 수는 size 1. 거래 수치는 예약 도메인 연동 전 0 고정.
 * 셸이 세션을, biz/layout의 RoleGuard가 역할을 보장하므로 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css(dash-*)
 */
export default function BizDashboardContent() {
  const { me } = useMe();
  const [proposals, setProposals] = useState<PageResponse<MyProposal> | null>(null);
  const [serviceCount, setServiceCount] = useState<number | null>(null);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    fetchMyProposals({ page: 0, size: 3 })
      .then((page) => {
        if (!cancelled) setProposals(page);
      })
      .catch(() => {
        if (!cancelled)
          setProposals({ content: [], page: 0, size: 3, totalElements: 0, totalPages: 0 });
      });
    fetchMyServiceListings({ page: 0, size: 1 })
      .then((page) => {
        if (!cancelled) setServiceCount(page.totalElements);
      })
      .catch(() => {
        if (!cancelled) setServiceCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [me]);

  if (!me) return null;

  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">{displayName(me)}님의 업체 공간이에요.</h1>
      <p className="mypage-page__subtitle">내 서비스와 보낸 제안 현황이에요.</p>

      {/* 거래 수치는 예약 도메인 연동 전 0 고정 */}
      <DashHero
        main={{
          label: "내 서비스",
          value: <>{serviceCount ?? "–"}건</>,
          href: "/mypage/biz/services",
        }}
        subs={[
          {
            label: "보낸 제안",
            value: <>{proposals?.totalElements ?? "–"}건</>,
            href: "/mypage/biz/proposals",
          },
          { label: "진행 중 거래", value: "0건" },
        ]}
      />

      <DashQuickActions
        actions={[
          {
            label: "서비스 등록",
            href: "/mypage/biz/services/new",
            icon: <CaseIcon size={22} />,
            tint: "sky",
          },
          {
            label: "받은 요청",
            href: "/mypage/biz/received",
            icon: <InboxIcon size={22} />,
            tint: "violet",
          },
          {
            label: "보낸 제안",
            href: "/mypage/biz/proposals",
            icon: <ClipboardCheckIcon size={22} />,
            tint: "emerald",
          },
          {
            label: "업체 정보",
            href: "/mypage/biz/profile",
            icon: <BuildingsIcon size={22} />,
            tint: "amber",
          },
        ]}
      />

      <DashSection title="최근 내역" moreHref="/mypage/biz/proposals">
        {proposals === null ? (
          <p className="mypage-group__note">불러오는 중…</p>
        ) : proposals.content.length === 0 ? (
          <MypageEmpty message="아직 보낸 제안이 없어요." />
        ) : (
          <ul className="dash-recent">
            {proposals.content.map((item) => (
              <li key={item.id} className="dash-recent__item">
                <Link href={`/requests/${item.requestId}`} className="dash-recent__link">
                  <span className="dash-recent__body">
                    <span className="dash-recent__title">
                      {item.requestTitle ?? "삭제된 요청"}
                    </span>
                    <span className="dash-recent__meta">
                      {/* 요청이 삭제되면 카테고리가 null */}
                      {item.requestCategory &&
                        `${getCategoryByCode(item.requestCategory).label} · `}
                      제안 {formatWon(item.amount)} · {formatDate(item.createdDate)}
                    </span>
                  </span>
                  <span
                    className={`proposal-status proposal-status--${item.status.toLowerCase()}`}
                  >
                    {PROPOSAL_STATUS_LABEL[item.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashSection>
    </div>
  );
}
