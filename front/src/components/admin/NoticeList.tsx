"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  fetchAdminNotices,
  type AdminNoticeSummary,
  type PageResponse,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";

const FILTERS: { value: "" | "true" | "false"; label: string }[] = [
  { value: "", label: "전체" },
  { value: "true", label: "공개" },
  { value: "false", label: "비공개" },
];

const PAGE_SIZE = 20;

/** 공지사항 관리 목록 — 공개 여부 필터·검색어(제목·본문)·페이지를 URL 쿼리로 동기화(ApplicationList와 같은 패턴). */
export default function NoticeList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publishedParam = searchParams.get("published") ?? "";
  const qParam = searchParams.get("q")?.trim() ?? "";
  const pageParam = Number(searchParams.get("page") ?? "0");
  const [keywordInput, setKeywordInput] = useState(qParam);

  const requestKey = `${publishedParam}|${qParam}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    page?: PageResponse<AdminNoticeSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminNotices({
      published: publishedParam ? publishedParam === "true" : undefined,
      q: qParam || undefined,
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
  }, [publishedParam, qParam, pageParam, requestKey]);

  const data = result?.key === requestKey ? result.page : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const navigate = (published: string, q: string, page: number) => {
    const query = new URLSearchParams();
    if (published) query.set("published", published);
    if (q) query.set("q", q);
    if (page > 0) query.set("page", String(page));
    const qs = query.toString();
    router.replace(`/admin/notices${qs ? `?${qs}` : ""}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(publishedParam, keywordInput.trim(), 0);
  };

  return (
    <>
      <nav aria-label="공개 여부 필터" className="admin-filter">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => navigate(filter.value, qParam, 0)}
            aria-current={publishedParam === filter.value ? "true" : undefined}
            className={`admin-filter__item${
              publishedParam === filter.value ? " admin-filter__item--active" : ""
            }`}
          >
            {filter.label}
          </button>
        ))}
        {data && (
          <span className="admin-filter__total">총 {data.totalElements}건</span>
        )}
      </nav>

      <form
        role="search"
        onSubmit={handleSearch}
        className="admin-search admin-search--below"
      >
        <input
          type="search"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="제목·내용으로 검색"
          aria-label="공지 검색"
          maxLength={100}
          className="admin-search__input"
        />
        <button type="submit" className="btn btn--outline admin-search__btn">
          검색
        </button>
      </form>

      {error && <p className="admin-error">{error}</p>}
      {!error && !data && <p className="admin-loading">불러오는 중…</p>}
      {data && data.content.length === 0 && (
        <p className="admin-loading">
          {qParam ? "검색 결과가 없어요." : "등록된 공지가 없어요."}
        </p>
      )}

      {data && data.content.length > 0 && (
        <div className="admin-table-wrap admin-table-wrap--gap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">제목</th>
                <th scope="col">공개</th>
                <th scope="col">작성자</th>
                <th scope="col" className="admin-table__num">
                  조회
                </th>
                <th scope="col" className="admin-table__num">
                  등록일
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((notice) => (
                <tr
                  key={notice.id}
                  className="admin-table__row--link"
                  onClick={() => router.push(`/admin/notices/${notice.id}`)}
                >
                  <td>
                    <Link
                      href={`/admin/notices/${notice.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="admin-table__primary"
                    >
                      {notice.pinned && (
                        <span className="admin-table__muted">[고정] </span>
                      )}
                      {notice.title}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`admin-status${
                        notice.published ? " admin-status--published" : ""
                      }`}
                    >
                      {notice.published ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="admin-table__muted">{notice.authorLoginId}</td>
                  <td className="admin-table__num">{notice.viewCount}</td>
                  <td className="admin-table__num">
                    {formatDate(notice.createdDate)}
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
          onChange={(page) => navigate(publishedParam, qParam, page)}
        />
      )}
    </>
  );
}
