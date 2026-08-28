"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";
import {
  INQUIRY_STATUS_LABEL,
  fetchMyInquiry,
  type MyInquiryDetail as MyInquiryDetailData,
} from "@/lib/support";

/** 내 문의 상세 — 문의 내용 그룹 + 답변 그룹(마이페이지 공통 문법, 본문도 "내용" 라벨 행). 타인 문의는 서버가 404(I001). */
export default function MyInquiryDetail({ id }: { id: number }) {
  const [inquiry, setInquiry] = useState<MyInquiryDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyInquiry(id)
      .then((data) => {
        if (!cancelled) setInquiry(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <p className="mypage-group__error">{error}</p>;
  if (!inquiry) return <p className="mypage-group__note">불러오는 중…</p>;

  return (
    <div className="mypage-settings">
      <section className="mypage-group" aria-labelledby="my-inquiry-title">
        <div className="mypage-group__header">
          <h2 id="my-inquiry-title" className="mypage-group__title">
            문의 내용
          </h2>
        </div>
        <dl className="mypage-rows">
          <div className="mypage-row">
            <dt className="mypage-row__label">상태</dt>
            <dd className="mypage-row__value">
              <span className={`inquiry-status inquiry-status--${inquiry.status.toLowerCase()}`}>
                {INQUIRY_STATUS_LABEL[inquiry.status]}
              </span>
            </dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">작성일</dt>
            <dd className="mypage-row__value">{formatDateTime(inquiry.createdDate)}</dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">제목</dt>
            <dd className="mypage-row__value">{inquiry.title}</dd>
          </div>
          <div className="mypage-row mypage-row--multiline">
            <dt className="mypage-row__label">내용</dt>
            <dd className="mypage-row__value">{inquiry.content}</dd>
          </div>
        </dl>
      </section>

      <section className="mypage-group" aria-labelledby="my-inquiry-answer-title">
        <div className="mypage-group__header">
          <h2 id="my-inquiry-answer-title" className="mypage-group__title">
            답변
          </h2>
        </div>
        {inquiry.status === "ANSWERED" && inquiry.answer ? (
          <>
            <dl className="mypage-rows">
              <div className="mypage-row">
                <dt className="mypage-row__label">답변일</dt>
                <dd className="mypage-row__value">
                  {inquiry.answeredDate ? formatDateTime(inquiry.answeredDate) : "-"}
                </dd>
              </div>
              <div className="mypage-row mypage-row--multiline">
                <dt className="mypage-row__label">내용</dt>
                <dd className="mypage-row__value">{inquiry.answer}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="inquiry-detail__pending">
            아직 답변이 등록되지 않았어요. 담당자가 확인 후 답변드릴게요.
          </p>
        )}
      </section>
    </div>
  );
}
