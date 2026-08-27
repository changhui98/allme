"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  fetchAdminInquiries,
  type AdminInquirySummary,
  type PageResponse,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { INQUIRY_STATUS_LABEL, type InquiryStatus } from "@/lib/support";

const FILTERS: { value: InquiryStatus | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "답변 대기" },
  { value: "ANSWERED", label: "답변 완료" },
];

const PAGE_SIZE = 20;

/** 1:1 문의 관리 목록 — 상태 필터·페이지를 URL 쿼리로 동기화(대시보드 링크 대응). */
export default function InquiryList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "0");

  const requestKey = `${statusParam}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    page?: PageResponse<AdminInquirySummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminInquiries({
      status: (statusParam || undefined) as InquiryStatus | undefined,
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
    router.replace(`/admin/service/inquiries${qs ? `?${qs}` : ""}`);
  };

  return (
    <>
      <nav aria-label="문의 상태 필터" className="admin-filter">
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
        {data && (
          <span className="admin-filter__total">총 {data.totalElements}건</span>
        )}
      </nav>

      {error && <p className="admin-error">{error}</p>}
      {!error && !data && <p className="admin-loading">불러오는 중…</p>}
      {data && data.content.length === 0 && (
        <p className="admin-loading">해당 상태의 문의가 없어요.</p>
      )}

      {data && data.content.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">제목</th>
                <th scope="col">작성자</th>
                <th scope="col">상태</th>
                <th scope="col">답변자</th>
                <th scope="col" className="admin-table__num">
                  작성일
                </th>
                <th scope="col" className="admin-table__num">
                  답변일
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className="admin-table__row--link"
                  onClick={() => router.push(`/admin/service/inquiries/${inquiry.id}`)}
                >
                  <td>
                    <Link
                      href={`/admin/service/inquiries/${inquiry.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="admin-table__primary"
                    >
                      {inquiry.title}
                    </Link>
                  </td>
                  <td className="admin-table__muted">{inquiry.authorLoginId}</td>
                  <td>
                    <span
                      className={`admin-status admin-status--${inquiry.status.toLowerCase()}`}
                    >
                      {INQUIRY_STATUS_LABEL[inquiry.status]}
                    </span>
                  </td>
                  <td className="admin-table__muted">
                    {inquiry.answeredByLoginId ?? "—"}
                  </td>
                  <td className="admin-table__num">
                    {formatDate(inquiry.createdDate)}
                  </td>
                  <td className="admin-table__num">
                    {inquiry.answeredDate ? formatDate(inquiry.answeredDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <AdminPagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(page) => navigate(statusParam, page)}
        />
      )}
    </>
  );
}
