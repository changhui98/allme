"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  APPLICATION_STATUS_LABEL,
  fetchApplications,
  type ApplicationStatus,
  type PageResponse,
  type ProviderApplicationSummary,
} from "@/lib/admin";

const FILTERS: { value: ApplicationStatus | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
];

const PAGE_SIZE = 20;

/**
 * 업체 신청 심사 목록 — 상태 필터·페이지를 URL 쿼리로 동기화한다
 * (뒤로가기·새로고침·대시보드의 ?status=PENDING 링크 대응).
 */
export default function ApplicationList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "0");

  // 요청 키가 현재 쿼리와 다르면 로딩으로 취급 — effect 안 동기 setState 없이 상태 리셋
  const requestKey = `${statusParam}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    page?: PageResponse<ProviderApplicationSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchApplications({
      status: (statusParam || undefined) as ApplicationStatus | undefined,
      page: pageParam,
      size: PAGE_SIZE,
    })
      .then((page) => {
        if (!cancelled) setResult({ key: requestKey, page });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: requestKey, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [statusParam, pageParam, requestKey]);

  const data = result?.key === requestKey ? result.page : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const navigate = (status: string, page: number) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (page > 0) query.set("page", String(page));
    const qs = query.toString();
    router.replace(`/admin/applications${qs ? `?${qs}` : ""}`);
  };

  return (
    <>
      <nav aria-label="신청 상태 필터" className="admin-filter">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => navigate(filter.value, 0)}
            aria-current={statusParam === filter.value ? "true" : undefined}
            className={`admin-filter__item${
              statusParam === filter.value ? " admin-filter__item--active" : ""
            }`}
          >
            {filter.label}
          </button>
        ))}
      </nav>

      {error && <p className="admin-error">{error}</p>}
      {!error && !data && <p className="admin-loading">불러오는 중…</p>}

      {data && data.content.length === 0 && (
        <p className="admin-loading">해당 상태의 신청이 없어요.</p>
      )}

      {data && data.content.length > 0 && (
        <ul className="admin-list">
          {data.content.map((application) => (
            <li key={application.id}>
              <Link
                href={`/admin/applications/${application.id}`}
                className="admin-list__row"
              >
                <span className="admin-list__main">
                  {application.businessName}
                </span>
                <span className="admin-list__meta">
                  {application.applicantLoginId}
                </span>
                <span
                  className={`admin-status admin-status--${application.status.toLowerCase()}`}
                >
                  {APPLICATION_STATUS_LABEL[application.status]}
                </span>
                <span className="admin-list__date">
                  {application.createdDate.slice(0, 10)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="btn btn--outline"
            disabled={data.page === 0}
            onClick={() => navigate(statusParam, data.page - 1)}
          >
            이전
          </button>
          <span className="admin-pagination__info">
            {data.page + 1} / {data.totalPages} 페이지
          </span>
          <button
            type="button"
            className="btn btn--outline"
            disabled={data.page >= data.totalPages - 1}
            onClick={() => navigate(statusParam, data.page + 1)}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
