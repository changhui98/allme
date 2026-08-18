"use client";

import { useRef, useState } from "react";
import Avatar from "@/components/mypage/Avatar";
import { useMe } from "@/lib/use-me";
import { uploadProfileImage } from "@/lib/user";

/**
 * 내 정보 본문 — 프로필 사진 업로드(교체)·이름·아이디·로그아웃.
 * 업로드 성공 시 풀 리로드로 useMe 캐시를 초기화해 상단 바 아바타까지 반영한다.
 * 셸(MypageShell)이 이미 세션을 보장하므로 여기서는 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css
 */
export default function ProfileSection() {
  const { me } = useMe();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!me) return null;

  const handleFileChange = async (file: File | undefined) => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      await uploadProfileImage(file);
      // 상단 바 아바타(useMe 모듈 캐시)까지 갱신되도록 풀 리로드
      window.location.reload();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "프로필 이미지 업로드에 실패했습니다.",
      );
      setUploading(false);
    }
  };

  return (
    <section aria-label="내 정보" className="mypage-profile">
      {/* 아바타 + 요약 — 좌측 정렬 가로 배치 (박스 없음) */}
      <div className="mypage-profile__head">
        <Avatar name={me.name} imageUrl={me.profileImageUrl} size="lg" />
        <div className="mypage-profile__summary">
          <p className="mypage-profile__name">{me.name}</p>
          <p className="mypage-profile__login-id">{me.loginId}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => void handleFileChange(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mypage-profile__upload"
          >
            {uploading ? "업로드 중..." : "사진 변경"}
          </button>
          {error ? (
            <p className="mypage-profile__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="mypage-profile__facts">
        <div className="mypage-profile__fact">
          <dt className="mypage-profile__fact-label">이름</dt>
          <dd className="mypage-profile__fact-value">{me.name}</dd>
        </div>
        <div className="mypage-profile__fact">
          <dt className="mypage-profile__fact-label">아이디</dt>
          <dd className="mypage-profile__fact-value">{me.loginId}</dd>
        </div>
      </dl>

    </section>
  );
}
