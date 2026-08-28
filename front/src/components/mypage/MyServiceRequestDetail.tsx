"use client";

import { useCallback, useEffect, useState } from "react";
import ReceivedProposalList from "@/components/mypage/ReceivedProposalList";
import { API_BASE_URL } from "@/lib/api";
import { getCategoryByCode } from "@/lib/categories";
import { formatDateTime } from "@/lib/format";
import { formatRegion } from "@/lib/regions";
import {
  SERVICE_REQUEST_STATUS_LABEL,
  UNIT_TYPE_LABEL,
  fetchMyServiceRequest,
  formatBudget,
  formatSchedule,
  type MyServiceRequestDetail as MyServiceRequestDetailData,
} from "@/lib/service-requests";

/**
 * 내 요청 상세 — 요청 정보 그룹(mypage-rows) + 참고 사진 그룹 + 받은 제안 그룹. 타인 요청은 서버가 404(R001).
 * 상세 주소는 본인에게만 내려오는 값이라 여기서만 보여준다. 제안 수락·거절 후엔 version을 올려 둘 다 다시 불러온다.
 */
export default function MyServiceRequestDetail({ id }: { id: number }) {
  const [item, setItem] = useState<MyServiceRequestDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetchMyServiceRequest(id)
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

  if (error) return <p className="mypage-group__error">{error}</p>;
  if (!item) return <p className="mypage-group__note">불러오는 중…</p>;

  const category = getCategoryByCode(item.category);

  return (
    <div className="mypage-settings">
      <section className="mypage-group" aria-labelledby="my-request-title">
        <div className="mypage-group__header">
          <h2 id="my-request-title" className="mypage-group__title">
            요청 정보
          </h2>
        </div>
        <dl className="mypage-rows">
          <div className="mypage-row">
            <dt className="mypage-row__label">상태</dt>
            <dd className="mypage-row__value">
              <span className={`request-status request-status--${item.status.toLowerCase()}`}>
                {SERVICE_REQUEST_STATUS_LABEL[item.status]}
              </span>
            </dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">등록일</dt>
            <dd className="mypage-row__value">{formatDateTime(item.createdDate)}</dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">카테고리</dt>
            <dd className="mypage-row__value">{category.label}</dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">지역</dt>
            <dd className="mypage-row__value">{formatRegion(item.region)}</dd>
          </div>
          {item.addressDetail && (
            <div className="mypage-row">
              <dt className="mypage-row__label">상세 주소</dt>
              <dd className="mypage-row__value">{item.addressDetail}</dd>
            </div>
          )}
          <div className="mypage-row">
            <dt className="mypage-row__label">희망 일정</dt>
            <dd className="mypage-row__value">
              {formatSchedule(item.preferredDate, item.scheduleNegotiable)}
            </dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">희망 예산</dt>
            <dd className="mypage-row__value">
              {formatBudget(item.budgetMin, item.budgetMax, item.budgetNegotiable)}
            </dd>
          </div>
          {item.unitValue !== null && (
            <div className="mypage-row">
              <dt className="mypage-row__label">작업 규모</dt>
              <dd className="mypage-row__value">
                {item.unitValue.toLocaleString("ko-KR")}
                {UNIT_TYPE_LABEL[item.unitType]}
              </dd>
            </div>
          )}
          <div className="mypage-row">
            <dt className="mypage-row__label">제목</dt>
            <dd className="mypage-row__value">{item.title}</dd>
          </div>
          <div className="mypage-row mypage-row--multiline">
            <dt className="mypage-row__label">내용</dt>
            <dd className="mypage-row__value">{item.content}</dd>
          </div>
        </dl>
      </section>

      <section className="mypage-group" aria-labelledby="my-request-attachments-title">
        <div className="mypage-group__header">
          <h2 id="my-request-attachments-title" className="mypage-group__title">
            참고 사진
          </h2>
        </div>
        {item.attachments.length > 0 ? (
          <ul className="request-detail__attachments">
            {item.attachments.map((attachment, index) => (
              <li key={attachment.fileId} className="request-detail__attachment">
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
        ) : (
          <p className="mypage-group__note">첨부한 사진이 없어요.</p>
        )}
      </section>

      <section className="mypage-group" aria-labelledby="my-request-proposals-title">
        <div className="mypage-group__header">
          <h2 id="my-request-proposals-title" className="mypage-group__title">
            받은 제안 <span className="mypage-group__count">{item.proposalCount}</span>
          </h2>
        </div>
        <ReceivedProposalList
          requestId={item.id}
          requestOpen={item.status === "OPEN"}
          version={version}
          onChanged={reload}
        />
      </section>
    </div>
  );
}
