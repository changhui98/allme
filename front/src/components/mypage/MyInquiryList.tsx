"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import MypageEmpty from "@/components/mypage/MypageEmpty";
import type { PageResponse } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import {
  INQUIRY_STATUS_LABEL,
  fetchMyInquiries,
  type MyInquirySummary,
} from "@/lib/support";

const PAGE_SIZE = 20;

/** 내 문의 목록 — mypage-group 안의 hairline 행. 비어 있으면 문의 작성 CTA. 스타일: styles/pages/support.css */
export default function MyInquiryList() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{
    page: number;
    data?: PageResponse<MyInquirySummary>;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyInquiries({ page, size: PAGE_SIZE })
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
    return (
      <MypageEmpty
        message="아직 보낸 문의가 없어요."
        ctaLabel="1:1 문의하기"
        ctaHref="/support/inquiry"
      />
    );
  }

  return (
    <>
      <ul className="inquiry-list">
        {data.content.map((inquiry) => (
          <li key={inquiry.id} className="inquiry-list__item">
            <Link href={`/mypage/inquiries/${inquiry.id}`} className="inquiry-list__link">
              <span className="inquiry-list__title">{inquiry.title}</span>
              <span className={`inquiry-status inquiry-status--${inquiry.status.toLowerCase()}`}>
                {INQUIRY_STATUS_LABEL[inquiry.status]}
              </span>
              <time dateTime={inquiry.createdDate} className="inquiry-list__date">
                {formatDate(inquiry.createdDate)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
      <AdminPagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </>
  );
}
