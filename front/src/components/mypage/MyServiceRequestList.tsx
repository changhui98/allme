"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import MypageEmpty from "@/components/mypage/MypageEmpty";
import type { PageResponse } from "@/lib/admin";
import { getCategoryByCode } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { formatRegion } from "@/lib/regions";
import {
  SERVICE_REQUEST_STATUS_LABEL,
  fetchMyServiceRequests,
  formatBudget,
  formatSchedule,
  type MyServiceRequestSummary,
} from "@/lib/service-requests";

const PAGE_SIZE = 20;

/**
 * 내가 등록한 서비스 요청 목록 — mypage-group 안의 hairline 행.
 * 요청 등록 버튼은 그룹 헤더에 있으므로 빈 상태 CTA는 게시판 둘러보기(다른 동선)만 둔다.
 * 스타일: styles/pages/mypage.css(request-list·request-status)
 */
export default function MyServiceRequestList() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{
    page: number;
    data?: PageResponse<MyServiceRequestSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyServiceRequests({ page, size: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setResult({ page, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ page, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const data = result?.page === page ? result.data : undefined;
  const error = result?.page === page ? result.error : undefined;

  if (error) return <p className="mypage-group__error">{error}</p>;
  if (!data) return <p className="mypage-group__note">불러오는 중…</p>;
  if (data.content.length === 0) {
    return (
      <MypageEmpty
        message="아직 요청한 서비스가 없어요."
        ctaLabel="해주세요 둘러보기"
        ctaHref="/requests"
      />
    );
  }

  return (
    <>
      <ul className="request-list">
        {data.content.map((item) => (
          <li key={item.id} className="request-list__item">
            <Link href={`/mypage/requests/${item.id}`} className="request-list__link">
              <span className="request-list__body">
                <span className="request-list__title">{item.title}</span>
                <span className="request-list__meta">
                  {getCategoryByCode(item.category).label} · {formatRegion(item.region)} ·{" "}
                  {formatSchedule(item.preferredDate, item.scheduleNegotiable)} ·{" "}
                  {formatBudget(item.budgetMin, item.budgetMax, item.budgetNegotiable)}
                </span>
              </span>
              <span className={`request-status request-status--${item.status.toLowerCase()}`}>
                {SERVICE_REQUEST_STATUS_LABEL[item.status]}
              </span>
              <time dateTime={item.createdDate} className="request-list__date">
                {formatDate(item.createdDate)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
      <AdminPagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </>
  );
}
