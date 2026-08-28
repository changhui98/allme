"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import MypageEmpty from "@/components/mypage/MypageEmpty";
import type { PageResponse } from "@/lib/admin";
import { getCategoryByCode } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { PROPOSAL_STATUS_LABEL, fetchMyProposals, type MyProposal } from "@/lib/proposals";
import { formatWon } from "@/lib/service-requests";

const PAGE_SIZE = 20;

/** 업체가 보낸 제안 목록 — 요청 제목(공개 상세 링크)·카테고리·금액·상태·날짜. 스타일: mypage.css(request-list·proposal-status 재사용) */
export default function MyProposalList() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{
    page: number;
    data?: PageResponse<MyProposal>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyProposals({ page, size: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setResult({ page, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ page, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const data = result?.page === page ? result.data : undefined;
  const error = result?.page === page ? result.error : undefined;

  if (error) return <p className="mypage-group__error">{error}</p>;
  if (!data) return <p className="mypage-group__note">불러오는 중…</p>;
  if (data.content.length === 0) {
    // 둘러보기 버튼은 그룹 헤더에 있으므로 빈 상태엔 중복 노출하지 않는다
    return <MypageEmpty message="아직 보낸 제안이 없어요. 해주세요에서 요청을 찾아 제안해보세요." />;
  }

  return (
    <>
      <ul className="request-list">
        {data.content.map((item) => (
          <li key={item.id} className="request-list__item">
            <Link href={`/requests/${item.requestId}`} className="request-list__link">
              <span className="request-list__body">
                <span className="request-list__title">{item.requestTitle ?? "삭제된 요청"}</span>
                <span className="request-list__meta">
                  {item.requestCategory ? getCategoryByCode(item.requestCategory).label : "-"} · 제안{" "}
                  {formatWon(item.amount)}
                  {item.requestStatus === "CLOSED" && " · 요청 마감"}
                </span>
              </span>
              <span className={`proposal-status proposal-status--${item.status.toLowerCase()}`}>
                {PROPOSAL_STATUS_LABEL[item.status]}
              </span>
              <time dateTime={item.createdDate} className="request-list__date">
                {formatDate(item.createdDate)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
      <AdminPagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </>
  );
}
