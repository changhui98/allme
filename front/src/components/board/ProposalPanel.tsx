"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/common/Modal";
import { currentPath, loginHref } from "@/lib/login-redirect";
import {
  PROPOSAL_STATUS_LABEL,
  fetchMyProposalForRequest,
  submitProposal,
  type MyProposal,
} from "@/lib/proposals";
import { formatWon, manwonToWon } from "@/lib/service-requests";
import { useMe } from "@/lib/use-me";
import { hasRole } from "@/lib/user";

/**
 * 공개 요청 상세의 제안 영역 — 로그인·역할·요청 상태에 따라 분기한다:
 * 세션 확인 중 → 빈 패널 / 비로그인 → 로그인 CTA / 내 요청 → 마이페이지 링크 / 업체 아님 → 안내 /
 * 이미 제안함 → 내 제안 요약 / 마감 → 안내 / 그 외 → 제안 폼(금액 만원 + 메시지).
 * 스타일: styles/pages/board.css(proposal-panel·proposal-form)
 */
export default function ProposalPanel({
  requestId,
  requestOpen,
  mine,
  onSubmitted,
}: {
  requestId: number;
  requestOpen: boolean;
  mine: boolean;
  onSubmitted: () => void;
}) {
  const { status, me } = useMe();
  const isProvider = hasRole(me, "PROVIDER");
  const [myProposal, setMyProposal] = useState<MyProposal | null | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // 업체 로그인 상태에서만 내 제안 여부를 조회한다
  useEffect(() => {
    if (!isProvider || mine) return;
    let cancelled = false;
    fetchMyProposalForRequest(requestId)
      .then((p) => {
        if (!cancelled) setMyProposal(p);
      })
      .catch(() => {
        if (!cancelled) setMyProposal(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isProvider, mine, requestId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const manwon = Number(amount);
    if (amount.trim() === "" || !Number.isInteger(manwon) || manwon <= 0) {
      setSubmitError("제안 금액을 만원 단위 숫자로 입력해주세요.");
      return;
    }
    if (!message.trim()) {
      setSubmitError("제안 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await submitProposal(requestId, {
        amount: manwonToWon(manwon),
        message: message.trim(),
      });
      setMyProposal(created);
      setDone(true);
      onSubmitted();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "제안 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  let body: React.ReactNode;
  if (status === "loading") {
    body = null;
  } else if (!me) {
    body = (
      <>
        <p className="proposal-panel__text">업체 회원으로 로그인하면 이 요청에 제안할 수 있어요.</p>
        <Link href={loginHref(currentPath())} className="btn btn--primary proposal-panel__btn">
          로그인하고 제안하기
        </Link>
      </>
    );
  } else if (mine) {
    body = (
      <>
        <p className="proposal-panel__text">내가 올린 요청이에요. 받은 제안은 마이페이지에서 확인해요.</p>
        <Link href={`/mypage/requests/${requestId}`} className="btn btn--outline proposal-panel__btn">
          받은 제안 보기
        </Link>
      </>
    );
  } else if (!isProvider) {
    body = (
      <p className="proposal-panel__text">
        제안은 업체 회원만 할 수 있어요. 업체로 활동하려면 업체 등록을 신청해주세요.
      </p>
    );
  } else if (myProposal === undefined) {
    body = <p className="proposal-panel__text">불러오는 중…</p>;
  } else if (myProposal) {
    body = (
      <>
        <p className="proposal-panel__text">이 요청에 보낸 내 제안</p>
        <p className="proposal-panel__amount">{formatWon(myProposal.amount)}</p>
        <p className={`proposal-status proposal-status--${myProposal.status.toLowerCase()}`}>
          {PROPOSAL_STATUS_LABEL[myProposal.status]}
        </p>
        <p className="proposal-panel__message">{myProposal.message}</p>
        <Link href="/mypage/biz/proposals" className="btn btn--outline proposal-panel__btn">
          보낸 제안 관리
        </Link>
      </>
    );
  } else if (!requestOpen) {
    body = <p className="proposal-panel__text">마감된 요청이라 더 이상 제안할 수 없어요.</p>;
  } else {
    body = (
      <form onSubmit={handleSubmit} className="proposal-form" noValidate>
        <div className="proposal-form__field">
          <label htmlFor="proposal-amount" className="proposal-form__label">
            제안 금액
          </label>
          <div className="proposal-form__unit">
            <input
              id="proposal-amount"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 150"
              disabled={submitting}
              className="proposal-form__input"
            />
            <span className="proposal-form__unit-label">만원</span>
          </div>
        </div>
        <div className="proposal-form__field">
          <label htmlFor="proposal-message" className="proposal-form__label">
            제안 내용
          </label>
          <textarea
            id="proposal-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            placeholder="작업 방식·일정·포함 범위를 간단히 적어주세요. (2,000자 이내)"
            disabled={submitting}
            className="proposal-form__textarea"
          />
        </div>
        {submitError && (
          <p className="proposal-form__error" role="alert">
            {submitError}
          </p>
        )}
        <button type="submit" className="btn btn--primary proposal-panel__btn" disabled={submitting}>
          {submitting ? "보내는 중…" : "제안 보내기"}
        </button>
      </form>
    );
  }

  return (
    <>
      <section className="proposal-panel" aria-label="제안">
        <h2 className="proposal-panel__title">해드릴게요</h2>
        {body}
      </section>

      <Modal
        open={done}
        title="제안을 보냈어요"
        onClose={() => setDone(false)}
        actions={
          <button type="button" className="btn btn--primary modal__btn" onClick={() => setDone(false)}>
            확인
          </button>
        }
      >
        <p>요청한 분이 확인하고 수락하면 알려드릴게요. 보낸 제안은 마이페이지 &gt; 업체 모드에서 볼 수 있어요.</p>
      </Modal>
    </>
  );
}
