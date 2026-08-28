"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProposalPanel from "@/components/board/ProposalPanel";
import { API_BASE_URL } from "@/lib/api";
import { getCategoryByCode } from "@/lib/categories";
import { formatDateTime } from "@/lib/format";
import { formatRegion } from "@/lib/regions";
import {
  SERVICE_REQUEST_STATUS_LABEL,
  UNIT_TYPE_LABEL,
  fetchOpenServiceRequest,
  formatBudget,
  formatSchedule,
  type OpenServiceRequestDetail,
} from "@/lib/service-requests";

/**
 * 해주세요 공개 상세 — 요청 정보(제목·작성자·사실 그리드·내용·참고 사진) + 제안 영역(ProposalPanel).
 * 상세 주소는 공개 API가 내리지 않는다(매칭 후 별도). 제안 등록 후 reload로 제안 수를 갱신한다.
 */
export default function RequestDetail({ id }: { id: number }) {
  const [item, setItem] = useState<OpenServiceRequestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetchOpenServiceRequest(id)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  if (error) {
    return (
      <div className="board-page__empty">
        <p>{error}</p>
        <Link href="/requests" className="btn btn--outline request-page__back-btn">
          목록으로
        </Link>
      </div>
    );
  }
  if (!item) return <p className="board-page__empty">불러오는 중…</p>;

  const category = getCategoryByCode(item.category);
  const isOpen = item.status === "OPEN";

  return (
    <>
      <Link href="/requests" className="support-back support-back--above">
        ← 해주세요
      </Link>

      <header className="request-page__head">
        <div className="request-page__badges">
          <span className="pill">{category.label}</span>
          <span className={`request-status request-status--${item.status.toLowerCase()}`}>
            {SERVICE_REQUEST_STATUS_LABEL[item.status]}
          </span>
        </div>
        <h1 className="request-page__title">{item.title}</h1>
        <p className="request-page__meta">
          {item.authorNickname ?? "탈퇴한 회원"} · {formatRegion(item.region)} ·{" "}
          {formatDateTime(item.createdDate)}
        </p>
      </header>

      <div className="request-page__layout">
        <div className="request-page__main">
          <dl className="request-page__facts">
            <div className="request-page__fact">
              <dt className="request-page__fact-label">희망 일정</dt>
              <dd className="request-page__fact-value">
                {formatSchedule(item.preferredDate, item.scheduleNegotiable)}
              </dd>
            </div>
            <div className="request-page__fact">
              <dt className="request-page__fact-label">희망 예산</dt>
              <dd className="request-page__fact-value">
                {formatBudget(item.budgetMin, item.budgetMax, item.budgetNegotiable)}
              </dd>
            </div>
            <div className="request-page__fact">
              <dt className="request-page__fact-label">작업 규모</dt>
              <dd className="request-page__fact-value">
                {item.unitValue !== null
                  ? `${item.unitValue.toLocaleString("ko-KR")}${UNIT_TYPE_LABEL[item.unitType]}`
                  : "미정"}
              </dd>
            </div>
            <div className="request-page__fact">
              <dt className="request-page__fact-label">받은 제안</dt>
              <dd className="request-page__fact-value">{item.proposalCount}건</dd>
            </div>
          </dl>

          <section className="request-page__section">
            <h2 className="request-page__heading">요청 내용</h2>
            <p className="request-page__content">{item.content}</p>
          </section>

          {item.attachments.length > 0 && (
            <section className="request-page__section">
              <h2 className="request-page__heading">참고 사진</h2>
              <ul className="request-detail__attachments">
                {item.attachments.map((attachment, index) => (
                  <li key={attachment.fileId}>
                    <a
                      href={`${API_BASE_URL}${attachment.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="request-detail__attachment-link"
                    >
                      {/* 백엔드 정적 서빙 이미지라 next/image 최적화 대상이 아님 */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${API_BASE_URL}${attachment.url}`}
                        alt={`참고 사진 ${index + 1}`}
                        className="request-detail__attachment-image"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="request-page__side">
          <ProposalPanel
            requestId={item.id}
            requestOpen={isOpen}
            mine={item.mine}
            onSubmitted={reload}
          />
        </aside>
      </div>
    </>
  );
}
