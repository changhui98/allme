"use client";

import { useRef, useState } from "react";
import Avatar from "@/components/mypage/Avatar";
import DashSection from "@/components/mypage/DashSection";
import FormField from "@/components/auth/FormField";
import MarketingConsentSection from "@/components/mypage/MarketingConsentSection";
import SettlementAccountSection from "@/components/mypage/SettlementAccountSection";
import { useMe } from "@/lib/use-me";
import {
  NICKNAME_RULES,
  displayName,
  fetchRandomNickname,
  updateNickname,
  uploadProfileImage,
} from "@/lib/user";

/**
 * 내 정보 본문 — 대시보드와 같은 토스풍 카드형: 그라데이션 프로필 카드(dash-hero + profile-hero) + DashSection 카드.
 * 프로필 카드(아바타·닉네임·아이디·사진 변경/닉네임 변경 필 버튼) 아래에 닉네임 편집 패널(편집 중일 때만),
 * 계정 정보 · 정산 계좌(SettlementAccountSection) · 알림 설정(MarketingConsentSection) 카드를 쌓는다.
 * 사진·닉네임 변경 성공 시 풀 리로드로 useMe 캐시를 초기화해 상단 바까지 반영한다.
 * 셸(MypageShell)이 이미 세션을 보장하므로 여기서는 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css (dash-hero · profile-hero · dash-section · dash-card · mypage-rows)
 */
export default function ProfileSection() {
  const { me } = useMe();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [savingNickname, setSavingNickname] = useState(false);
  // 잠금 판정 기준 시각 — 렌더 순수성을 위해 마운트 시 1회 스냅샷(변경 성공 시 풀 리로드라 충분)
  const [renderedAt] = useState(() => Date.now());

  if (!me) return null;

  // 닉네임 변경 주기(백엔드 U021과 동일 정책) — 잠금 중이면 버튼을 막고 가능 시각을 안내한다
  const nicknameChangeableAt = me.nicknameChangeableAt
    ? new Date(me.nicknameChangeableAt)
    : null;
  const nicknameLocked =
    nicknameChangeableAt !== null && nicknameChangeableAt.getTime() > renderedAt;

  const handleFileChange = async (file: File | undefined) => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadProfileImage(file);
      // 상단 바 아바타(useMe 모듈 캐시)까지 갱신되도록 풀 리로드
      window.location.reload();
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "프로필 이미지 업로드에 실패했습니다.",
      );
      setUploading(false);
    }
  };

  const openNicknameEdit = () => {
    setNicknameInput(me.nickname ?? "");
    setNicknameError(null);
    setEditingNickname(true);
  };

  const handleRandomNickname = async () => {
    try {
      setNicknameInput(await fetchRandomNickname());
      setNicknameError(null);
    } catch (e) {
      setNicknameError(
        e instanceof Error ? e.message : "닉네임 추천에 실패했습니다.",
      );
    }
  };

  const handleNicknameSave = async () => {
    if (savingNickname) return;
    // 백엔드와 동일 정규화(trim + 연속 공백 축약) 후 검증 — 통과 못 하면 요청 없이 인라인 안내
    const nickname = nicknameInput.trim().replace(/ +/g, " ");
    if (!NICKNAME_RULES.pattern.test(nickname)) {
      setNicknameError(NICKNAME_RULES.message);
      return;
    }
    if (nickname === me.nickname) {
      setEditingNickname(false);
      return;
    }
    setSavingNickname(true);
    setNicknameError(null);
    try {
      await updateNickname(nickname);
      // 상단 바·인사말(useMe 모듈 캐시)까지 갱신되도록 풀 리로드
      window.location.reload();
    } catch (e) {
      // U014(형식)·U015(중복) 모두 서버 메시지를 그대로 인라인 노출
      setNicknameError(
        e instanceof Error ? e.message : "닉네임 변경에 실패했습니다.",
      );
      setSavingNickname(false);
    }
  };

  return (
    <section aria-label="내 정보" className="mypage-profile">
      {/* 프로필 카드 — 대외 표시 정보(닉네임·사진). 그라데이션·장식은 dash-hero, 배치는 profile-hero */}
      <div className="dash-hero profile-hero">
        <Avatar
          name={displayName(me)}
          imageUrl={me.profileImageUrl}
          size="lg"
        />
        <div className="profile-hero__body">
          <p className="profile-hero__name">{displayName(me)}</p>
          <p className="profile-hero__id">{me.loginId}</p>
          {nicknameLocked && nicknameChangeableAt ? (
            <p className="profile-hero__hint">
              닉네임은 2일에 한 번 바꿀 수 있어요 ·{" "}
              {formatChangeableAt(nicknameChangeableAt)}부터 가능
            </p>
          ) : null}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => void handleFileChange(e.target.files?.[0])}
        />
        <div className="profile-hero__actions">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="profile-hero__btn"
          >
            {uploading ? "업로드 중..." : "사진 변경"}
          </button>
          <button
            type="button"
            onClick={openNicknameEdit}
            disabled={nicknameLocked || editingNickname}
            className="profile-hero__btn"
          >
            닉네임 변경
          </button>
        </div>
      </div>
      {/* 업로드 오류 — 그라데이션 위 danger 색은 대비가 나빠 카드 아래에 둔다 */}
      {uploadError ? (
        <p className="mypage-profile__error" role="alert">
          {uploadError}
        </p>
      ) : null}

      {editingNickname ? (
        <DashSection title="닉네임 변경" variant="panel">
          <form
            className="profile-edit"
            onSubmit={(e) => {
              e.preventDefault();
              void handleNicknameSave();
            }}
          >
            <FormField
              id="nickname"
              label="닉네임"
              type="text"
              autoComplete="nickname"
              value={nicknameInput}
              onChange={(value) => {
                setNicknameInput(value);
                setNicknameError(null);
              }}
              error={nicknameError ?? undefined}
            />
            <div className="mypage-profile__edit-actions">
              <button
                type="button"
                onClick={() => void handleRandomNickname()}
                className="btn btn--outline mypage-profile__edit-btn"
              >
                랜덤 다시 뽑기
              </button>
              <button
                type="submit"
                disabled={savingNickname}
                className="btn btn--primary mypage-profile__edit-btn"
              >
                {savingNickname ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => setEditingNickname(false)}
                disabled={savingNickname}
                className="btn btn--outline mypage-profile__edit-btn"
              >
                취소
              </button>
            </div>
          </form>
        </DashSection>
      ) : null}

      {/* 계정 정보 — 실명은 여기서만 노출(계약·정산 전용) */}
      <DashSection title="계정 정보" titleId="account-info-title">
        <dl className="mypage-rows">
          <div className="mypage-row">
            <dt className="mypage-row__label">이름</dt>
            <dd className="mypage-row__value">{me.name}</dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">아이디</dt>
            <dd className="mypage-row__value">{me.loginId}</dd>
          </div>
        </dl>
        <p className="dash-card__note">
          실명은 다른 사용자에게 공개되지 않고 계약·정산에만 사용돼요.
        </p>
      </DashSection>

      <SettlementAccountSection />
      <MarketingConsentSection />
    </section>
  );
}

/** 변경 가능 시각 표기 — 예: "8월 27일 오전 11:20" */
function formatChangeableAt(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
