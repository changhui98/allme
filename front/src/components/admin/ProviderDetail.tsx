"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import {
  fetchActiveProvider,
  revokeProvider,
  type ActiveProviderDetail,
} from "@/lib/admin";
import { formatDateTime } from "@/lib/format";

/**
 * 활동 업체 상세 — 최신 승인 신청서의 업체 정보 + 계정 정보, 하단에 자격 해제·목록 버튼.
 * 해제 성공 시 목록으로 replace(뒤로가기로 해제된 업체 상세 재진입 방지 — 재진입하면 P006).
 */
export default function ProviderDetail({ userId }: { userId: number }) {
  const router = useRouter();
  const [detail, setDetail] = useState<ActiveProviderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchActiveProvider(userId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleRevoke = async () => {
    if (!revokeReason.trim()) {
      setActionError("해제 사유를 입력해주세요.");
      return;
    }
    setProcessing(true);
    setActionError(null);
    try {
      await revokeProvider(userId, revokeReason.trim());
      router.replace("/admin/providers/active");
    } catch (e) {
      setActionError((e as Error).message);
      setProcessing(false);
      setRevokeOpen(false);
    }
  };

  if (error) return <p className="admin-error">{error}</p>;
  if (!detail) return <p className="admin-loading">불러오는 중…</p>;

  type Row = { term: string; desc: string | null; multiline?: boolean };

  const application = detail.application;
  const businessRows: Row[] = application
    ? [
        { term: "업체명", desc: application.businessName },
        { term: "사업자등록번호", desc: application.businessRegistrationNumber },
        { term: "업체 소개", desc: application.introduction, multiline: true },
        { term: "연락처", desc: application.contactPhone },
      ]
    : [];
  const accountRows: Row[] = [
    { term: "아이디", desc: detail.loginId },
    {
      term: "신청일",
      desc: application ? formatDateTime(application.createdDate) : null,
    },
    {
      term: "승인일",
      desc: application?.approvedDate ? formatDateTime(application.approvedDate) : null,
    },
    { term: "승인자", desc: application?.approvedByLoginId ?? null },
  ];

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
        <section className="mypage-group" aria-labelledby="provider-business-title">
          <div className="mypage-group__header">
            <h2 id="provider-business-title" className="mypage-group__title">
              업체 정보
            </h2>
          </div>
          {application ? (
            <dl className="mypage-rows">{businessRows.map(renderRow)}</dl>
          ) : (
            <p className="admin-loading">
              승인된 신청서가 없어요. 업체 역할이 수동으로 부여된 계정이에요.
            </p>
          )}
        </section>

        <section className="mypage-group" aria-labelledby="provider-account-title">
          <div className="mypage-group__header">
            <h2 id="provider-account-title" className="mypage-group__title">
              계정 정보
            </h2>
          </div>
          <dl className="mypage-rows">{accountRows.map(renderRow)}</dl>
        </section>
      </div>

      {actionError && <p className="admin-error">{actionError}</p>}

      <div className="admin-actions">
        <button
          type="button"
          className="btn btn--danger admin-actions__btn"
          disabled={processing}
          onClick={() => setRevokeOpen(true)}
        >
          업체 자격 해제
        </button>
        <Link
          href="/admin/providers/active"
          className="btn btn--outline admin-actions__btn admin-actions__btn--end"
        >
          목록으로
        </Link>
      </div>

      <Modal
        open={revokeOpen}
        title="업체 자격 해제"
        onClose={() => setRevokeOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="btn btn--outline admin-modal__btn"
              disabled={processing}
              onClick={() => setRevokeOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn--danger admin-modal__btn"
              disabled={processing}
              onClick={handleRevoke}
            >
              해제하기
            </button>
          </>
        }
      >
        <p className="admin-modal__desc">
          해제하면 이 회원은 즉시 업체 기능을 쓸 수 없게 되고, 다시 활동하려면 새로 신청해야 해요.
        </p>
        <textarea
          value={revokeReason}
          onChange={(e) => setRevokeReason(e.target.value)}
          maxLength={500}
          placeholder="해제 사유를 입력해주세요. (500자 이내, 내부 기록용)"
          className="admin-form__textarea"
        />
      </Modal>
    </>
  );
}
