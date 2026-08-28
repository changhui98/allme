"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import Avatar from "@/components/mypage/Avatar";
import { formatDate } from "@/lib/format";
import { fetchPublicProviderProfile, type PublicProviderProfile } from "@/lib/providers";

/**
 * 업체 정보 모달 — 받은 제안 행의 업체명을 누르면 공개 프로필을 보여준다:
 * 사진·업체명·닉네임·활동 시작일, 지표(계약 진행·리뷰·평점), 소개, 포트폴리오.
 * 리뷰·평점·포트폴리오는 도메인이 아직 없어 빈 상태로 자리만 둔다(도메인 생기면 그대로 채운다).
 * "업체 바로 가기"는 공개 업체 페이지(/providers/{userId}), "메시지 보내기"는 메시지 기능 전까지 비활성.
 * 스타일: styles/pages/mypage.css(provider-profile)
 */
export default function ProviderProfileModal({
  userId,
  onClose,
}: {
  /** null이면 닫힘 */
  userId: number | null;
  onClose: () => void;
}) {
  // 결과에 userId를 함께 담아, 다른 업체를 열면 이전 결과를 쓰지 않는다(effect 안 동기 setState 없이 리셋)
  const [result, setResult] = useState<{
    userId: number;
    data?: PublicProviderProfile;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;
    fetchPublicProviderProfile(userId)
      .then((data) => {
        if (!cancelled) setResult({ userId, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ userId, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profile = result?.userId === userId ? result.data : undefined;
  const error = result?.userId === userId ? result.error : undefined;

  return (
    <Modal
      open={userId !== null}
      title="업체 정보"
      onClose={onClose}
      size="wide"
      actions={
        <>
          <button type="button" className="btn btn--outline modal__btn" onClick={onClose}>
            닫기
          </button>
          {userId !== null && (
            <Link href={`/providers/${userId}`} className="btn btn--outline modal__btn">
              업체 바로 가기
            </Link>
          )}
          <button type="button" className="btn btn--primary modal__btn" disabled title="메시지 기능은 준비 중이에요">
            메시지 보내기
          </button>
        </>
      }
    >
      {error && <p className="mypage-group__error">{error}</p>}
      {!error && !profile && <p className="provider-profile__note">불러오는 중…</p>}
      {profile && (
        <div className="provider-profile">
          <div className="provider-profile__head">
            <Avatar
              name={profile.businessName ?? profile.nickname}
              imageUrl={profile.profileImageUrl}
              size="lg"
            />
            <div className="provider-profile__body">
              <p className="provider-profile__name">{profile.businessName ?? "업체명 미등록"}</p>
              <p className="provider-profile__nickname">{profile.nickname}</p>
              {profile.providerSince && (
                <p className="provider-profile__meta">활동 시작 {formatDate(profile.providerSince)}</p>
              )}
            </div>
          </div>

          <dl className="provider-profile__stats">
            <div className="provider-profile__stat">
              <dt className="provider-profile__stat-label">계약 진행</dt>
              <dd className="provider-profile__stat-value">
                {profile.contractCount.toLocaleString("ko-KR")}건
              </dd>
            </div>
            <div className="provider-profile__stat">
              <dt className="provider-profile__stat-label">리뷰</dt>
              <dd className="provider-profile__stat-value">0개</dd>
            </div>
            <div className="provider-profile__stat">
              <dt className="provider-profile__stat-label">평점</dt>
              <dd className="provider-profile__stat-value">
                <span aria-hidden="true" className="provider-profile__star">★</span> -
              </dd>
            </div>
          </dl>

          <section className="provider-profile__section">
            <h3 className="provider-profile__section-title">소개</h3>
            <p className="provider-profile__intro">
              {profile.introduction ?? "아직 업체 소개가 등록되지 않았어요."}
            </p>
          </section>

          <section className="provider-profile__section">
            <h3 className="provider-profile__section-title">포트폴리오</h3>
            <p className="provider-profile__empty">아직 등록된 포트폴리오가 없어요.</p>
          </section>

          <p className="provider-profile__hint">
            리뷰·평점·포트폴리오는 거래 완료·리뷰 기능과 함께 채워져요. 메시지 기능도 준비 중이에요.
          </p>
        </div>
      )}
    </Modal>
  );
}
