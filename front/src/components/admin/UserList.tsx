"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  fetchAdminUsers,
  type AdminUserSummary,
  type PageResponse,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";
import type { UserRole } from "@/lib/user";

const PAGE_SIZE = 20;

/** 역할 필터 탭 — USER는 "일반 회원"(USER 외 역할 없음), 나머지는 해당 역할 보유 */
const FILTERS: { value: UserRole | ""; label: string }[] = [
  { value: "", label: "전체 회원" },
  { value: "USER", label: "일반" },
  { value: "PROVIDER", label: "업체" },
  { value: "MANAGER", label: "매니저" },
  { value: "ADMIN", label: "관리자" },
];

const ROLE_VALUES = new Set<string>(["USER", "PROVIDER", "MANAGER", "ADMIN"]);

/** 운영 권한 역할 — 칩을 브랜드 색으로 구분 */
const STAFF_ROLES = new Set(["MANAGER", "ADMIN"]);

/**
 * 회원 목록 — 역할 탭 + loginId 검색 + 데이터 테이블. 탈퇴 회원은 흐리게.
 * 역할(?role)·검색어(?q)·페이지(?page)를 URL 쿼리로 동기화한다(대시보드 링크·뒤로가기 대응).
 */
export default function UserList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = searchParams.get("role") ?? "";
  const roleParam = (ROLE_VALUES.has(roleRaw) ? roleRaw : "") as UserRole | "";
  const qParam = searchParams.get("q")?.trim() ?? "";
  const pageParam = Number(searchParams.get("page") ?? "0");
  const [keywordInput, setKeywordInput] = useState(qParam);

  const requestKey = `${roleParam}|${qParam}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    page?: PageResponse<AdminUserSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminUsers({
      loginId: qParam || undefined,
      role: roleParam || undefined,
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
  }, [roleParam, qParam, pageParam, requestKey]);

  const data = result?.key === requestKey ? result.page : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const navigate = (role: string, q: string, page: number) => {
    const query = new URLSearchParams();
    if (role) query.set("role", role);
    if (q) query.set("q", q);
    if (page > 0) query.set("page", String(page));
    const qs = query.toString();
    router.replace(`/admin/users${qs ? `?${qs}` : ""}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(roleParam, keywordInput.trim(), 0);
  };

  return (
    <>
      <nav aria-label="역할 필터" className="admin-filter">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => navigate(filter.value, qParam, 0)}
            aria-current={roleParam === filter.value ? "true" : undefined}
            className={`admin-filter__item${
              roleParam === filter.value ? " admin-filter__item--active" : ""
            }`}
          >
            {filter.label}
          </button>
        ))}
        {data && (
          <span className="admin-filter__total">총 {data.totalElements}명</span>
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
          placeholder="아이디로 검색"
          aria-label="아이디 검색"
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
          {qParam ? "검색 결과가 없어요." : "해당 역할의 회원이 없어요."}
        </p>
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
                      className={`admin-status ${
                        user.withdrawn
                          ? "admin-status--rejected"
                          : "admin-status--active"
                      }`}
                    >
                      {user.withdrawn ? "탈퇴" : "활성"}
                    </span>
                  </td>
                  <td className="admin-table__num">
                    {formatDate(user.createdDate)}
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
          onChange={(page) => navigate(roleParam, qParam, page)}
        />
      )}
    </>
  );
}
