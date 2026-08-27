"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import type { PageResponse } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import {
  NOTICE_SORTS,
  NOTICE_SORT_LABEL,
  fetchNotices,
  type NoticeSort,
  type NoticeSummary,
} from "@/lib/support";

const PAGE_SIZE = 20;

/**
 * 공지사항 공개 목록 — 헤딩 아래 툴바(왼쪽 검색, 오른쪽 최신순·조회순) + hairline 목록. 상단 고정이 항상 먼저.
 * 검색어(?q, 제목·본문 부분 일치)·정렬(?sort=VIEWS, 기본 최신순은 생략)·페이지(?page)를 URL로 동기화한다.
 * 스타일: styles/pages/support.css
 */
export default function NoticeList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q")?.trim() ?? "";
  const sortParam: NoticeSort =
    searchParams.get("sort") === "VIEWS" ? "VIEWS" : "LATEST";
  const pageParam = Number(searchParams.get("page") ?? "0");
  const [keywordInput, setKeywordInput] = useState(qParam);

  // 요청 키가 현재 쿼리와 다르면 로딩으로 취급 — effect 안 동기 setState 없이 상태 리셋
  const requestKey = `${qParam}|${sortParam}|${pageParam}`;
  const [result, setResult] = useState<{
    key: string;
    data?: PageResponse<NoticeSummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNotices({
      q: qParam || undefined,
      sort: sortParam,
      page: pageParam,
      size: PAGE_SIZE,
    })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: requestKey, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [qParam, sortParam, pageParam, requestKey]);

  const data = result?.key === requestKey ? result.data : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const navigate = (q: string, sort: NoticeSort, page: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (sort !== "LATEST") query.set("sort", sort);
    if (page > 0) query.set("page", String(page));
    const qs = query.toString();
    router.push(`/notice${qs ? `?${qs}` : ""}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(keywordInput.trim(), sortParam, 0);
  };

  return (
    <>
      <div className="notice-toolbar">
        <form role="search" onSubmit={handleSearch} className="notice-search">
          <button
            type="submit"
            aria-label="검색"
            className="notice-search__icon"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
          <input
            type="search"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="공지 검색"
            aria-label="공지 검색"
            maxLength={100}
            className="notice-search__input"
          />
        </form>
        <nav aria-label="정렬" className="notice-sort">
          {NOTICE_SORTS.map((sort) => (
            <button
              key={sort}
              type="button"
              onClick={() => navigate(qParam, sort, 0)}
              aria-current={sortParam === sort ? "true" : undefined}
              className={`notice-sort__item${sortParam === sort ? " notice-sort__item--active" : ""}`}
            >
              {NOTICE_SORT_LABEL[sort]}
            </button>
          ))}
        </nav>
      </div>

      {qParam && data && (
        <p className="board-page__result-line">
          <span className="board-page__result-query">
            &lsquo;{qParam}&rsquo;
          </span>{" "}
          검색 결과 {data.totalElements}건
          <Link href="/notice" className="notice-search__reset">
            초기화
          </Link>
        </p>
      )}

      {error && <p className="board-page__empty">{error}</p>}
      {!error && !data && <p className="board-page__empty">불러오는 중…</p>}
      {data && data.content.length === 0 && (
        <p className="board-page__empty">
          {qParam
            ? "검색 결과가 없어요. 다른 단어로 찾아보세요."
            : "아직 등록된 공지사항이 없어요."}
        </p>
      )}

      {data && data.content.length > 0 && (
        <ul className="notice-list">
          {data.content.map((notice) => (
            <li
              key={notice.id}
              className={`notice-list__item${notice.pinned ? " notice-list__item--pinned" : ""}`}
            >
              <Link href={`/notice/${notice.id}`} className="notice-list__link">
                {notice.pinned && (
                  <span
                    className="notice-list__pin"
                    role="img"
                    aria-label="고정 공지"
                  >
                    ★
                  </span>
                )}
                <span className="notice-list__title">{notice.title}</span>
                <span className="notice-list__views">
                  조회 {notice.viewCount}
                </span>
                <time
                  dateTime={notice.createdDate}
                  className="notice-list__date"
                >
                  {formatDate(notice.createdDate)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <AdminPagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(page) => navigate(qParam, sortParam, page)}
        />
      )}
    </>
  );
}
