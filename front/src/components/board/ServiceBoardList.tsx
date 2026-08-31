"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import ServiceCard from "@/components/board/ServiceCard";
import type { PageResponse } from "@/lib/admin";
import { CATEGORIES, isCategoryId, type ServiceCategoryCode } from "@/lib/categories";
import {
  fetchOpenServiceListings,
  type OpenServiceListingSummary,
} from "@/lib/provider-services";

const PAGE_SIZE = 18;

/**
 * 해드려요 공개 목록 — ?category=(슬러그)·?q=·?page를 URL에서 읽어 게시 중 서비스를 불러온다.
 * URL 슬러그는 API 계약(enum code)으로 바꿔 보낸다. 검색 결과 줄도 여기서 그린다(totalElements 필요).
 */
export default function ServiceBoardList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? undefined;
  const categoryCode: ServiceCategoryCode | undefined = isCategoryId(categoryParam)
    ? CATEGORIES.find((c) => c.id === categoryParam)!.code
    : undefined;
  const query = searchParams.get("q")?.trim() || undefined;
  const pageParam = Number(searchParams.get("page") ?? "0");

  const requestKey = `${categoryCode ?? ""}|${query ?? ""}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    data?: PageResponse<OpenServiceListingSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOpenServiceListings({ category: categoryCode, q: query, page: pageParam, size: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: requestKey, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [categoryCode, query, pageParam, requestKey]);

  const data = result?.key === requestKey ? result.data : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (categoryParam) params.set("category", categoryParam);
    if (query) params.set("q", query);
    if (page > 0) params.set("page", String(page));
    const qs = params.toString();
    router.push(`/services${qs ? `?${qs}` : ""}`);
  };

  if (error) return <p className="board-page__empty">{error}</p>;
  if (!data) return <p className="board-page__empty">불러오는 중…</p>;

  return (
    <>
      {query && (
        <p className="board-page__result-line">
          <span className="board-page__result-query">&lsquo;{query}&rsquo;</span> 검색 결과{" "}
          {data.totalElements}건
        </p>
      )}
      {data.content.length === 0 ? (
        <p className="board-page__empty">
          {query
            ? "검색 결과가 없어요. 다른 검색어로 시도해 보세요."
            : "이 카테고리에 등록된 서비스가 아직 없어요."}
        </p>
      ) : (
        <>
          <ul className="card-grid">
            {data.content.map((post) => (
              <li key={post.id}>
                <ServiceCard post={post} />
              </li>
            ))}
          </ul>
          <AdminPagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
        </>
      )}
    </>
  );
}
