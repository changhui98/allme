"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import {
  APPLICATION_STATUS_LABEL,
  approveApplication,
  fetchApplication,
  rejectApplication,
  type ProviderApplicationDetail,
} from "@/lib/admin";

/**
 * 업체 신청 상세 — PENDING이면 승인/반려 처리, 처리 완료 건은 결과 표시.
 * 처리 성공 시 목록으로 replace(뒤로가기로 처리 화면 재진입 방지).
 */
export default function ApplicationDetail({ id }: { id: number }) {
  const router = useRouter();
  const [detail, setDetail] = useState<ProviderApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchApplication(id)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleApprove = async () => {
    setProcessing(true);
    setActionError(null);
    try {
      await approveApplication(id);
      router.replace("/admin/applications");
    } catch (e) {
      setActionError((e as Error).message);
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError("반려 사유를 입력해주세요.");
      return;
    }
    setProcessing(true);
    setActionError(null);
    try {
      await rejectApplication(id, rejectReason.trim());
      router.replace("/admin/applications");
    } catch (e) {
      setActionError((e as Error).message);
      setProcessing(false);
      setRejectOpen(false);
    }
  };

  if (error) return <p className="admin-error">{error}</p>;
  if (!detail) return <p className="admin-loading">불러오는 중…</p>;

  const formatDateTime = (value: string) => value.slice(0, 16).replace("T", " ");

  type Row = { term: string; desc: string | null; multiline?: boolean };

  const applicationRows: Row[] = [
    { term: "업체명", desc: detail.businessName },
    { term: "사업자등록번호", desc: detail.businessRegistrationNumber },
    { term: "업체 소개", desc: detail.introduction, multiline: true },
    { term: "연락처", desc: detail.contactPhone },
  ];

  const reviewRows: Row[] = [
    { term: "신청자", desc: detail.applicantLoginId },
    { term: "신청일", desc: formatDateTime(detail.createdDate) },
  ];
  if (detail.status !== "PENDING") {
    reviewRows.push(
      { term: "처리자", desc: detail.processedByLoginId },
      {
        term: "처리일",
        desc: detail.processedDate ? formatDateTime(detail.processedDate) : null,
      },
    );
    if (detail.status === "REJECTED") {
      reviewRows.push({
        term: "반려 사유",
        desc: detail.rejectReason,
        multiline: true,
      });
    }
  }

  const renderRow = (row: Row) => (
    <div
      key={row.term}
      className={`mypage-row${row.multiline ? " admin-row--multiline" : ""}`}
    >
      <dt className="mypage-row__label">{row.term}</dt>
      <dd className="mypage-row__value">{row.desc ?? "-"}</dd>
    </div>
  );

  return (
    <>
      {/* 마이페이지 공통 문법 — 세로 바 제목 그룹 + hairline 행, 카드 없음 */}
      <div className="mypage-settings">
        <section className="mypage-group" aria-labelledby="application-info-title">
          <div className="mypage-group__header">
            <h2 id="application-info-title" className="mypage-group__title">
              신청 정보
            </h2>
          </div>
          <dl className="mypage-rows">{applicationRows.map(renderRow)}</dl>
        </section>

        <section className="mypage-group" aria-labelledby="review-info-title">
          <div className="mypage-group__header">
            <h2 id="review-info-title" className="mypage-group__title">
              심사 정보
            </h2>
          </div>
          <dl className="mypage-rows">
            {/* 상태는 첫 행 — 떠 있는 칩 대신 다른 항목과 같은 위계로 */}
            <div className="mypage-row">
              <dt className="mypage-row__label">상태</dt>
              <dd className="mypage-row__value">
                <span
                  className={`admin-status admin-status--${detail.status.toLowerCase()}`}
                >
                  {APPLICATION_STATUS_LABEL[detail.status]}
                </span>
              </dd>
            </div>
            {reviewRows.map(renderRow)}
          </dl>
        </section>
      </div>

      {actionError && <p className="admin-error">{actionError}</p>}

      {detail.status === "PENDING" && (
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn--primary admin-actions__btn"
            disabled={processing}
            onClick={handleApprove}
          >
            승인
          </button>
          <button
            type="button"
            className="btn btn--outline admin-actions__btn"
            disabled={processing}
            onClick={() => setRejectOpen(true)}
          >
            반려
          </button>
        </div>
      )}

      <Modal
        open={rejectOpen}
        title="신청 반려"
        onClose={() => setRejectOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="btn btn--outline admin-modal__btn"
              disabled={processing}
              onClick={() => setRejectOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn--danger admin-modal__btn"
              disabled={processing}
              onClick={handleReject}
            >
              반려하기
            </button>
          </>
        }
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          maxLength={500}
          placeholder="신청자에게 전달될 반려 사유를 입력해주세요. (500자 이내)"
          className="admin-form__textarea"
        />
      </Modal>
    </>
  );
}
