"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  fetchAdminFaqs,
  type AdminFaqSummary,
  type PageResponse,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABEL,
  type FaqCategory,
} from "@/lib/support";

const PAGE_SIZE = 20;

/** FAQ 관리 목록 — 분류 필터·페이지를 URL 쿼리로 동기화. 정렬은 분류 → 노출 순서. */
export default function FaqList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "0");

  const requestKey = `${categoryParam}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    page?: PageResponse<AdminFaqSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminFaqs({
      category: (categoryParam || undefined) as FaqCategory | undefined,
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
  }, [categoryParam, pageParam, requestKey]);

  const data = result?.key === requestKey ? result.page : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const navigate = (category: string, page: number) => {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (page > 0) query.set("page", String(page));
    const qs = query.toString();
    router.replace(`/admin/service/faqs${qs ? `?${qs}` : ""}`);
  };

  const filters: { value: string; label: string }[] = [
    { value: "", label: "전체" },
    ...FAQ_CATEGORIES.map((c) => ({ value: c, label: FAQ_CATEGORY_LABEL[c] })),
  ];

  return (
    <>
      <nav aria-label="분류 필터" className="admin-filter">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => navigate(filter.value, 0)}
            aria-current={categoryParam === filter.value ? "true" : undefined}
            className={`admin-filter__item${
              categoryParam === filter.value ? " admin-filter__item--active" : ""
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
        <p className="admin-loading">등록된 FAQ가 없어요.</p>
      )}

      {data && data.content.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col" className="admin-table__order">
                  순서
                </th>
                <th scope="col">분류</th>
                <th scope="col">질문</th>
                <th scope="col">공개</th>
                <th scope="col" className="admin-table__num">
                  등록일
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((faq) => (
                <tr
                  key={faq.id}
                  className="admin-table__row--link"
                  onClick={() => router.push(`/admin/service/faqs/${faq.id}`)}
                >
                  <td className="admin-table__order">{faq.displayOrder}</td>
                  <td className="admin-table__muted">
                    {FAQ_CATEGORY_LABEL[faq.category]}
                  </td>
                  <td>
                    <Link
                      href={`/admin/service/faqs/${faq.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="admin-table__primary"
                    >
                      {faq.question}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`admin-status${
                        faq.published ? " admin-status--published" : ""
                      }`}
                    >
                      {faq.published ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="admin-table__num">{formatDate(faq.createdDate)}</td>
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
          onChange={(page) => navigate(categoryParam, page)}
        />
      )}
    </>
  );
}
