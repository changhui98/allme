"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  fetchAdminUsers,
  type AdminUserSummary,
  type PageResponse,
} from "@/lib/admin";

const PAGE_SIZE = 20;

/** 운영 권한 역할 — 칩을 브랜드 색으로 구분 */
const STAFF_ROLES = new Set(["MANAGER", "ADMIN"]);

/** 회원 목록 — 컬럼 헤더가 있는 데이터 테이블 + loginId 검색·역할 칩. 탈퇴 회원은 흐리게. */
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
      <div className="admin-filter">
        <span className="admin-filter__item admin-filter__item--active">
          전체 회원
        </span>
        {data && (
          <span className="admin-filter__total">총 {data.totalElements}명</span>
        )}
      </div>

      <form
        role="search"
        onSubmit={handleSearch}
        className="admin-search admin-search--below"
      >
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
        <div className="admin-table-wrap admin-table-wrap--gap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">아이디</th>
                <th scope="col">역할</th>
                <th scope="col">상태</th>
                <th scope="col" className="admin-table__num">
                  가입일
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((user) => (
                <tr
                  key={user.id}
                  className={user.withdrawn ? "admin-table__row--dim" : ""}
                >
                  <td>
                    <span className="admin-table__primary">{user.loginId}</span>
                  </td>
                  <td>
                    {user.roles.length > 0
                      ? user.roles.map((role) => (
                          <span
                            key={role}
                            className={`admin-role${
                              STAFF_ROLES.has(role) ? " admin-role--staff" : ""
                            }`}
                          >
                            {role}
                          </span>
                        ))
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={`admin-status${
                        user.withdrawn ? " admin-status--rejected" : ""
                      }`}
                    >
                      {user.withdrawn ? "탈퇴" : "활성"}
                    </span>
                  </td>
                  <td className="admin-table__num">
                    {user.createdDate.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
