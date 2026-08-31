"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import Modal from "@/components/common/Modal";
import MypageEmpty from "@/components/mypage/MypageEmpty";
import type { PageResponse } from "@/lib/admin";
import { API_BASE_URL } from "@/lib/api";
import { getCategoryByCode } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import {
  SERVICE_LISTING_STATUS_LABEL,
  deleteServiceListing,
  fetchMyServiceListings,
  formatListingPrice,
  formatRegions,
  hideServiceListing,
  publishServiceListing,
  type MyServiceListingSummary,
} from "@/lib/provider-services";

const PAGE_SIZE = 20;

/**
 * 내가 등록한 업체 서비스 목록 — mypage-group 안의 hairline 행(썸네일 + 제목 → 수정 링크 + 상태 칩 + 행 액션).
 * 숨기기/공개는 바로 토글하고, 삭제만 확인 모달을 거친다. 등록 버튼은 그룹 헤더에 있다.
 * 상태 칩은 request-status 재사용(공개=open·숨김=closed 모디파이어).
 * 스타일: styles/pages/mypage.css(service-list·request-status)
 */
export default function MyProviderServiceList() {
  const [page, setPage] = useState(0);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data?: PageResponse<MyServiceListingSummary>;
    error?: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyServiceListingSummary | null>(null);

  const requestKey = `${page}|${version}`;

  useEffect(() => {
    let cancelled = false;
    fetchMyServiceListings({ page, size: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: requestKey, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [page, requestKey]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const data = result?.key === requestKey ? result.data : undefined;
  const error = result?.key === requestKey ? result.error : undefined;

  const toggleVisibility = async (item: MyServiceListingSummary) => {
    if (actingId !== null) return;
    setActionError(null);
    setActingId(item.id);
    try {
      await (item.status === "PUBLISHED"
        ? hideServiceListing(item.id)
        : publishServiceListing(item.id));
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "상태 변경에 실패했습니다.");
    } finally {
      setActingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || actingId !== null) return;
    setActionError(null);
    setActingId(deleteTarget.id);
    try {
      await deleteServiceListing(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "서비스 삭제에 실패했습니다.");
      setDeleteTarget(null);
    } finally {
      setActingId(null);
    }
  };

  if (error) return <p className="mypage-group__error">{error}</p>;
  if (!data) return <p className="mypage-group__note">불러오는 중…</p>;
  if (data.content.length === 0) {
    return (
      <MypageEmpty
        message="아직 등록한 서비스가 없어요. 서비스를 등록하면 해드려요에 공개돼요."
        ctaLabel="해드려요 둘러보기"
        ctaHref="/services"
      />
    );
  }

  return (
    <>
      {actionError && (
        <p className="mypage-group__error" role="alert">
          {actionError}
        </p>
      )}
      <ul className="service-list">
        {data.content.map((item) => (
          <li key={item.id} className="service-list__item">
            <div className="service-list__row">
              {item.thumbnailUrl && (
                /* 백엔드 정적 서빙 이미지라 next/image 최적화 대상이 아님 */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`${API_BASE_URL}${item.thumbnailUrl}`}
                  alt=""
                  className="service-list__thumb"
                />
              )}
              <span className="service-list__body">
                <Link
                  href={`/mypage/biz/services/${item.id}/edit`}
                  className="service-list__title"
                >
                  {item.title}
                </Link>
                <span className="service-list__meta">
                  {getCategoryByCode(item.category).label} · {formatRegions(item.regions)} ·{" "}
                  {formatListingPrice(item.priceFrom, item.priceNegotiable)}
                  {item.duration ? ` · 소요 ${item.duration}` : ""}
                </span>
              </span>
              <span
                className={`request-status request-status--${
                  item.status === "PUBLISHED" ? "open" : "closed"
                }`}
              >
                {SERVICE_LISTING_STATUS_LABEL[item.status]}
              </span>
              <span className="service-list__actions">
                <button
                  type="button"
                  onClick={() => void toggleVisibility(item)}
                  disabled={actingId !== null}
                  className="service-list__action"
                >
                  {item.status === "PUBLISHED" ? "숨기기" : "공개"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  disabled={actingId !== null}
                  className="service-list__action service-list__action--danger"
                >
                  삭제
                </button>
              </span>
              <time dateTime={item.createdDate} className="service-list__date">
                {formatDate(item.createdDate)}
              </time>
            </div>
          </li>
        ))}
      </ul>
      <AdminPagination page={data.page} totalPages={data.totalPages} onChange={setPage} />

      <Modal
        open={deleteTarget !== null}
        title="서비스를 삭제할까요?"
        onClose={() => setDeleteTarget(null)}
        actions={
          <>
            <button
              type="button"
              className="btn btn--outline modal__btn"
              onClick={() => setDeleteTarget(null)}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn--primary modal__btn"
              onClick={() => void confirmDelete()}
              disabled={actingId !== null}
            >
              삭제
            </button>
          </>
        }
      >
        <p>
          &lsquo;{deleteTarget?.title}&rsquo; 서비스가 해드려요에서 내려가요. 삭제한 서비스는
          되돌릴 수 없어요.
        </p>
      </Modal>
    </>
  );
}
