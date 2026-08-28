"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/mypage/Avatar";
import { formatDate } from "@/lib/format";
import { fetchPublicProviderProfile, type PublicProviderProfile } from "@/lib/providers";

/**
 * 실제 업체(회원 id)의 공개 페이지 본문 — 공개 프로필 API로 채운다. 목업 업체(p1…)는 기존 서버 렌더 페이지가 담당.
 * 히어로(사진·업체명·닉네임·활동 시작) + 지표 3종(계약 진행·리뷰·평점) + 소개·포트폴리오·리뷰 섹션.
 * 리뷰·평점·포트폴리오는 도메인이 아직 없어 빈 상태로 자리만 둔다. 스타일: styles/pages/provider.css
 */
export default function ProviderPublicProfile({ userId }: { userId: number }) {
  const [profile, setProfile] = useState<PublicProviderProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicProviderProfile(userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (error) {
    return (
      <div className="board-page__empty">
        <p>{error}</p>
        <Link href="/requests" className="btn btn--outline provider-page__back-btn">
          해주세요로
        </Link>
      </div>
    );
  }
  if (!profile) return <p className="board-page__empty">불러오는 중…</p>;

  const name = profile.businessName ?? "업체명 미등록";

  return (
    <>
      <section>
        <div className="provider-hero__head">
          <Avatar name={name} imageUrl={profile.profileImageUrl} size="lg" />
          <div className="provider-hero__body">
            <div className="provider-hero__name-row">
              <h1 className="provider-hero__name">{name}</h1>
            </div>
            <p className="provider-hero__tagline">{profile.nickname}</p>
            <div className="provider-hero__meta">
              {profile.providerSince && (
                <span className="provider-hero__region">활동 시작 {formatDate(profile.providerSince)}</span>
              )}
              <span className="provider-hero__rating" aria-label="평점 없음, 리뷰 0개">
                <span aria-hidden="true" className="provider-hero__star">★</span>
                <span className="provider-hero__rating-value">-</span>
                <span className="provider-hero__review-count">(0)</span>
              </span>
            </div>
          </div>
        </div>

        <dl className="provider-hero__stats">
          <div>
            <dt className="provider-hero__stat-label">계약 진행</dt>
            <dd className="provider-hero__stat-value">{profile.contractCount.toLocaleString("ko-KR")}건</dd>
          </div>
          <div>
            <dt className="provider-hero__stat-label">리뷰</dt>
            <dd className="provider-hero__stat-value">0개</dd>
          </div>
          <div>
            <dt className="provider-hero__stat-label">평점</dt>
            <dd className="provider-hero__stat-value">-</dd>
          </div>
        </dl>
      </section>

      <div className="provider-page__main provider-page__main--single">
        <section>
          <h2 className="provider-page__heading">소개</h2>
          <div className="provider-page__bio">
            <p className="provider-page__paragraph">
              {profile.introduction ?? "아직 업체 소개가 등록되지 않았어요."}
            </p>
          </div>
        </section>

        <section>
          <h2 className="provider-page__heading">포트폴리오</h2>
          <p className="provider-page__empty">아직 등록된 포트폴리오가 없어요.</p>
        </section>

        <section>
          <h2 className="provider-page__heading">
            리뷰 <span className="provider-page__count">0</span>
          </h2>
          <p className="provider-page__empty">
            아직 리뷰가 없어요. 거래 완료·리뷰 기능과 함께 채워져요.
          </p>
        </section>
      </div>
    </>
  );
}
