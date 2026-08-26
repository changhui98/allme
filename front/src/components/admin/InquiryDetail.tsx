"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  answerInquiry,
  fetchAdminInquiry,
  type AdminInquiryDetail as AdminInquiryDetailData,
} from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { INQUIRY_STATUS_LABEL } from "@/lib/support";

/**
 * 1:1 문의 상세 — 문의 정보 그룹 + 답변 그룹(등록·수정 폼). 마이페이지 공통 문법(그룹 + hairline 행).
 * 답변 성공 시 상세를 다시 불러와 상태·답변자·답변일을 갱신한다(목록으로 이동하지 않음 — 이어서 수정 가능).
 */
export default function InquiryDetail({ id }: { id: number }) {
  const [detail, setDetail] = useState<AdminInquiryDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAdminInquiry(id)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setAnswer(data.answer ?? "");
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!answer.trim()) {
      setMessage({ ok: false, text: "답변을 입력해주세요." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await answerInquiry(id, answer.trim());
      setMessage({ ok: true, text: "답변을 저장했어요. 작성자의 내 문의에서 바로 볼 수 있어요." });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
    setSubmitting(false);
  };

  if (error) return <p className="admin-error">{error}</p>;
  if (!detail) return <p className="admin-loading">불러오는 중…</p>;

  const isAnswered = detail.status === "ANSWERED";

  return (
    <div className="mypage-settings">
      <section className="mypage-group" aria-labelledby="inquiry-info-title">
        <div className="mypage-group__header">
          <h2 id="inquiry-info-title" className="mypage-group__title">
            문의 정보
          </h2>
        </div>
        <dl className="mypage-rows">
          <div className="mypage-row">
            <dt className="mypage-row__label">상태</dt>
            <dd className="mypage-row__value">
              <span className={`admin-status admin-status--${detail.status.toLowerCase()}`}>
                {INQUIRY_STATUS_LABEL[detail.status]}
              </span>
            </dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">작성자</dt>
            <dd className="mypage-row__value">{detail.authorLoginId}</dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">작성일</dt>
            <dd className="mypage-row__value">{formatDateTime(detail.createdDate)}</dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">제목</dt>
            <dd className="mypage-row__value">{detail.title}</dd>
          </div>
          <div className="mypage-row admin-row--multiline">
            <dt className="mypage-row__label">내용</dt>
            <dd className="mypage-row__value">{detail.content}</dd>
          </div>
        </dl>
      </section>

      <section className="mypage-group" aria-labelledby="inquiry-answer-title">
        <div className="mypage-group__header">
          <h2 id="inquiry-answer-title" className="mypage-group__title">
            답변
          </h2>
        </div>
        {isAnswered && (
          <dl className="mypage-rows">
            <div className="mypage-row">
              <dt className="mypage-row__label">답변자</dt>
              <dd className="mypage-row__value">{detail.answeredByLoginId ?? "-"}</dd>
            </div>
            <div className="mypage-row">
              <dt className="mypage-row__label">답변일</dt>
              <dd className="mypage-row__value">
                {detail.answeredDate ? formatDateTime(detail.answeredDate) : "-"}
              </dd>
            </div>
          </dl>
        )}
        <form onSubmit={handleSubmit} className="admin-form" noValidate>
          <div className="admin-form__field">
            <label htmlFor="inquiry-answer" className="admin-form__label">
              {isAnswered ? "답변 수정" : "답변 작성"}
            </label>
            <textarea
              id="inquiry-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={10000}
              placeholder="작성자에게 전달될 답변을 입력해주세요."
              disabled={submitting}
              className="admin-form__textarea admin-form__textarea--tall"
            />
          </div>
          {message && (
            <p className={message.ok ? "admin-form__hint" : "admin-form__error"} role="status">
              {message.text}
            </p>
          )}
          <div className="admin-form__actions">
            <button
              type="submit"
              className="btn btn--primary admin-actions__btn"
              disabled={submitting}
            >
              {isAnswered ? "답변 수정" : "답변 등록"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
