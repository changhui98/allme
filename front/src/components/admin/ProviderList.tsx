"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  fetchActiveProviders,
  type ActiveProviderSummary,
  type PageResponse,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 20;

/**
 * 활동 업체 목록 — PROVIDER 역할 보유 회원의 데이터 테이블. 페이지를 URL 쿼리로 동기화한다.
 * 업체 정보가 없는 행(수동 역할 부여)은 "—"로 표시한다.
 */
export default function ProviderList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page") ?? "0");

  const requestKey = String(pageParam);
  const [result, setResult] = useState<{
    key: string;
    page?: PageResponse<ActiveProviderSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchActiveProviders({ page: pageParam, size: PAGE_SIZE })
      .then((page) => {
        if (!cancelled) setResult({ key: requestKey, page });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: requestKey, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [pageParam, requestKey]);

  const data = result?.key === requestKey ? result.page : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const navigate = (page: number) => {
    router.replace(`/admin/providers/active${page > 0 ? `?page=${page}` : ""}`);
  };

  return (
    <>
      {data && (
        <p className="admin-filter">
          <span className="admin-filter__total">총 {data.totalElements}개 업체</span>
        </p>
      )}

      {error && <p className="admin-error">{error}</p>}
      {!error && !data && <p className="admin-loading">불러오는 중…</p>}

      {data && data.content.length === 0 && (
        <p className="admin-loading">활동 중인 업체가 없어요.</p>
      )}

      {data && data.content.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">아이디</th>
                <th scope="col">업체명</th>
                <th scope="col">사업자등록번호</th>
                <th scope="col">승인자</th>
                <th scope="col" className="admin-table__num">
                  승인일
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((provider) => (
                <tr
                  key={provider.userId}
                  className="admin-table__row--link"
                  onClick={() =>
                    router.push(`/admin/providers/active/${provider.userId}`)
                  }
                >
                  <td>
                    <Link
                      href={`/admin/providers/active/${provider.userId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="admin-table__primary"
                    >
                      {provider.loginId}
                    </Link>
                  </td>
                  <td>{provider.businessName ?? "—"}</td>
                  <td className="admin-table__muted">
                    {provider.businessRegistrationNumber ?? "—"}
                  </td>
                  <td className="admin-table__muted">
                    {provider.approvedByLoginId ?? "—"}
                  </td>
                  <td className="admin-table__num">
                    {provider.approvedDate ? formatDate(provider.approvedDate) : "—"}
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
          onChange={navigate}
        />
      )}
    </>
  );
}
