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

  const rows: { term: string; desc: string | null }[] = [
    { term: "업체명", desc: detail.businessName },
    { term: "사업자등록번호", desc: detail.businessRegistrationNumber },
    { term: "업체 소개", desc: detail.introduction },
    { term: "연락처", desc: detail.contactPhone },
    { term: "신청자", desc: detail.applicantLoginId },
    { term: "신청일", desc: detail.createdDate.slice(0, 16).replace("T", " ") },
  ];
  if (detail.status !== "PENDING") {
    rows.push(
      { term: "처리자", desc: detail.processedByLoginId },
      {
        term: "처리일",
        desc: detail.processedDate
          ? detail.processedDate.slice(0, 16).replace("T", " ")
          : null,
      },
    );
    if (detail.status === "REJECTED") {
      rows.push({ term: "반려 사유", desc: detail.rejectReason });
    }
  }

  return (
    <>
      <span
        className={`admin-status admin-status--${detail.status.toLowerCase()}`}
      >
        {APPLICATION_STATUS_LABEL[detail.status]}
      </span>

      <dl className="admin-detail">
        {rows.map((row) => (
          <div key={row.term} className="admin-detail__row">
            <dt className="admin-detail__term">{row.term}</dt>
            <dd className="admin-detail__desc">{row.desc ?? "-"}</dd>
          </div>
        ))}
      </dl>

      {actionError && <p className="admin-error">{actionError}</p>}

      {detail.status === "PENDING" && (
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={processing}
            onClick={handleApprove}
          >
            승인
          </button>
          <button
            type="button"
            className="btn btn--outline"
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
              className="btn btn--outline"
              disabled={processing}
              onClick={() => setRejectOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn--danger"
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
          className="admin-reject__textarea"
        />
      </Modal>
    </>
  );
}
