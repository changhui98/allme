"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  fetchAdminUsers,
  type AdminUserSummary,
  type PageResponse,
} from "@/lib/admin";

const PAGE_SIZE = 20;

/** 회원 목록 — loginId 검색 + 역할 뱃지. 탈퇴 회원은 흐리게 표시. */
export default function UserList() {
  const [keywordInput, setKeywordInput] = useState("");
  const [query, setQuery] = useState({ keyword: "", page: 0 });

  const requestKey = `${query.keyword}|${query.page}`;
  const [result, setResult] = useState<{
    key: string;
    page?: PageResponse<AdminUserSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminUsers({
      loginId: query.keyword || undefined,
      page: query.page,
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
  }, [query, requestKey]);

  const data = result?.key === requestKey ? result.page : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setQuery({ keyword: keywordInput.trim(), page: 0 });
  };

  return (
    <>
      <form role="search" onSubmit={handleSearch} className="admin-search">
        <input
          type="search"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="아이디로 검색"
          aria-label="아이디 검색"
          className="admin-search__input"
        />
        <button type="submit" className="btn btn--outline">
          검색
        </button>
      </form>

      {error && <p className="admin-error">{error}</p>}
      {!error && !data && <p className="admin-loading">불러오는 중…</p>}
      {data && data.content.length === 0 && (
        <p className="admin-loading">검색 결과가 없어요.</p>
      )}

      {data && data.content.length > 0 && (
        <ul className="admin-list">
          {data.content.map((user) => (
            <li key={user.id}>
              <div
                className={`admin-list__row${
                  user.withdrawn ? " admin-list__row--dim" : ""
                }`}
              >
                <span className="admin-list__main">{user.loginId}</span>
                <span className="admin-list__meta">
                  {user.roles.join(" · ") || "-"}
                </span>
                <span
                  className={`admin-status${
                    user.withdrawn ? " admin-status--rejected" : ""
                  }`}
                >
                  {user.withdrawn ? "탈퇴" : "활성"}
                </span>
                <span className="admin-list__date">
                  {user.createdDate.slice(0, 10)}
                </span>
              </div>
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
            onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
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
            onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
