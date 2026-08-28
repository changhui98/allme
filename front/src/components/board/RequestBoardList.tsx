"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import RequestCard from "@/components/board/RequestCard";
import type { PageResponse } from "@/lib/admin";
import { CATEGORIES, isCategoryId, type ServiceCategoryCode } from "@/lib/categories";
import {
  fetchOpenServiceRequests,
  type OpenServiceRequestSummary,
} from "@/lib/service-requests";

const PAGE_SIZE = 18;

/**
 * 해주세요 공개 목록 — ?category=(슬러그)·?page를 URL에서 읽어 모집 중 요청을 불러온다.
 * URL 슬러그는 API 계약(enum code)으로 바꿔 보낸다.
 */
export default function RequestBoardList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? undefined;
  const categoryCode: ServiceCategoryCode | undefined = isCategoryId(categoryParam)
    ? CATEGORIES.find((c) => c.id === categoryParam)!.code
    : undefined;
  const pageParam = Number(searchParams.get("page") ?? "0");

  const requestKey = `${categoryCode ?? ""}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    data?: PageResponse<OpenServiceRequestSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOpenServiceRequests({ category: categoryCode, page: pageParam, size: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: requestKey, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [categoryCode, pageParam, requestKey]);

  const data = result?.key === requestKey ? result.data : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const goToPage = (page: number) => {
    const query = new URLSearchParams();
    if (categoryParam) query.set("category", categoryParam);
    if (page > 0) query.set("page", String(page));
    const qs = query.toString();
    router.push(`/requests${qs ? `?${qs}` : ""}`);
  };

  if (error) return <p className="board-page__empty">{error}</p>;
  if (!data) return <p className="board-page__empty">불러오는 중…</p>;
  if (data.content.length === 0) {
    return (
      <p className="board-page__empty">이 카테고리에 올라온 요청이 아직 없어요.</p>
    );
  }

  return (
    <>
      <ul className="card-grid">
        {data.content.map((post) => (
          <li key={post.id}>
            <RequestCard post={post} />
          </li>
        ))}
      </ul>
      <AdminPagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
    </>
  );
}
