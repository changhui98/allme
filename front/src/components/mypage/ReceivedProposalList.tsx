"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import MypageEmpty from "@/components/mypage/MypageEmpty";
import ProviderProfileModal from "@/components/mypage/ProviderProfileModal";
import { formatDateTime } from "@/lib/format";
import {
  PROPOSAL_STATUS_LABEL,
  acceptProposal,
  fetchReceivedProposals,
  rejectProposal,
  type ReceivedProposal,
} from "@/lib/proposals";
import { formatWon } from "@/lib/service-requests";

/**
 * 내 요청에 온 제안 목록 — 업체명(+닉네임)·금액·메시지·상태. 업체명을 누르면 업체 정보 모달(ProviderProfileModal).
 * "메시지 보내기"는 메시지 기능 전까지 비활성 자리. 요청이 모집 중이고 제안이 대기 중이면 수락/거절 버튼.
 * 수락은 확인 모달을 거치며(요청 마감 + 나머지 자동 거절), 처리 후 onChanged로 부모(요청 상세)를 갱신한다.
 * 스타일: styles/pages/mypage.css(proposal-list·proposal-status)
 */
export default function ReceivedProposalList({
  requestId,
  requestOpen,
  version,
  onChanged,
}: {
  requestId: number;
  requestOpen: boolean;
  /** 부모가 올리면 다시 불러온다 */
  version: number;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<ReceivedProposal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ action: "accept" | "reject"; proposal: ReceivedProposal } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReceivedProposals(requestId)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId, version]);

  const confirmAction = async () => {
    if (!pending || processing) return;
    setProcessing(true);
    setActionError(null);
    try {
      if (pending.action === "accept") await acceptProposal(requestId, pending.proposal.id);
      else await rejectProposal(requestId, pending.proposal.id);
      setPending(null);
      onChanged();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "처리에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  if (error) return <p className="mypage-group__error">{error}</p>;
  if (!items) return <p className="mypage-group__note">불러오는 중…</p>;
  if (items.length === 0) {
    return <MypageEmpty message="아직 받은 제안이 없어요. 업체들이 확인하면 여기에 쌓여요." />;
  }

  return (
    <>
      <ul className="proposal-list">
        {items.map((proposal) => (
          <li key={proposal.id} className="proposal-list__item">
            <div className="proposal-list__head">
              <button
                type="button"
                onClick={() => setProfileUserId(proposal.providerUserId)}
                className="proposal-list__provider"
                title="업체 정보 보기"
              >
                <span className="proposal-list__provider-name">
                  {proposal.providerName ?? proposal.providerNickname ?? "탈퇴한 업체"}
                </span>
                {proposal.providerNickname && proposal.providerName !== proposal.providerNickname && (
                  <span className="proposal-list__nickname">{proposal.providerNickname}</span>
                )}
              </button>
              <span className="proposal-list__amount">{formatWon(proposal.amount)}</span>
              <span className={`proposal-status proposal-status--${proposal.status.toLowerCase()}`}>
                {PROPOSAL_STATUS_LABEL[proposal.status]}
              </span>
            </div>
            <p className="proposal-list__message">{proposal.message}</p>
            <div className="proposal-list__foot">
              <time dateTime={proposal.createdDate} className="proposal-list__date">
                {formatDateTime(proposal.createdDate)}
              </time>
              <div className="proposal-list__actions">
                <button
                  type="button"
                  className="btn btn--outline proposal-list__btn"
                  disabled
                  title="메시지 기능은 준비 중이에요"
                >
                  메시지 보내기
                </button>
                {requestOpen && proposal.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      className="btn btn--outline proposal-list__btn"
                      onClick={() => setPending({ action: "reject", proposal })}
                    >
                      거절
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary proposal-list__btn"
                      onClick={() => setPending({ action: "accept", proposal })}
                    >
                      수락
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ProviderProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />

      <Modal
        open={pending !== null}
        title={pending?.action === "accept" ? "제안을 수락할까요?" : "제안을 거절할까요?"}
        onClose={() => {
          if (!processing) {
            setPending(null);
            setActionError(null);
          }
        }}
        actions={
          <>
            <button
              type="button"
              className="btn btn--outline modal__btn"
              disabled={processing}
              onClick={() => setPending(null)}
            >
              취소
            </button>
            <button
              type="button"
              className={`btn ${pending?.action === "accept" ? "btn--primary" : "btn--danger"} modal__btn`}
              disabled={processing}
              onClick={confirmAction}
            >
              {pending?.action === "accept" ? "수락하기" : "거절하기"}
            </button>
          </>
        }
      >
        {pending?.action === "accept" ? (
          <p>
            {pending.proposal.providerName ?? "이 업체"}의 {formatWon(pending.proposal.amount)} 제안을 수락하면
            요청이 마감되고 다른 제안은 자동으로 거절돼요.
          </p>
        ) : (
          <p>거절한 제안은 되돌릴 수 없어요.</p>
        )}
        {actionError && <p className="mypage-group__error">{actionError}</p>}
      </Modal>
    </>
  );
}
