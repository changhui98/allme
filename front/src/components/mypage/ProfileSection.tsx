"use client";

import { useRef, useState } from "react";
import Avatar from "@/components/mypage/Avatar";
import FormField from "@/components/auth/FormField";
import MarketingConsentCard from "@/components/mypage/MarketingConsentCard";
import SettlementAccountCard from "@/components/mypage/SettlementAccountCard";
import { useMe } from "@/lib/use-me";
import {
  NICKNAME_RULES,
  displayName,
  fetchRandomNickname,
  updateNickname,
  uploadProfileImage,
} from "@/lib/user";

/**
 * 내 정보 본문 — 2열 카드 그리드(A안 경계선 카드).
 * 프로필(아바타·닉네임·사진 변경·닉네임 인라인 편집) · 계정 정보(실명·아이디)
 * · 정산 계좌(SettlementAccountCard) · 알림 설정(MarketingConsentCard).
 * 사진·닉네임 변경 성공 시 풀 리로드로 useMe 캐시를 초기화해 상단 바까지 반영한다.
 * 셸(MypageShell)이 이미 세션을 보장하므로 여기서는 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css
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

  if (!me) return null;

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
      <div className="mypage-profile__grid">
        {/* 프로필 카드 — 대외 표시 정보(닉네임·사진) */}
        <article className="mypage-profile__card">
          <h2 className="mypage-profile__card-title">프로필</h2>
          <div className="mypage-profile__head">
            <Avatar
              name={displayName(me)}
              imageUrl={me.profileImageUrl}
              size="lg"
            />
            <div className="mypage-profile__summary">
              <p className="mypage-profile__name">{displayName(me)}</p>
              <p className="mypage-profile__login-id">{me.loginId}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => void handleFileChange(e.target.files?.[0])}
              />
              <div className="mypage-profile__actions">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mypage-profile__text-btn"
                >
                  {uploading ? "업로드 중..." : "사진 변경"}
                </button>
                {!editingNickname ? (
                  <button
                    type="button"
                    onClick={openNicknameEdit}
                    className="mypage-profile__text-btn"
                  >
                    닉네임 변경
                  </button>
                ) : null}
              </div>
              {uploadError ? (
                <p className="mypage-profile__error" role="alert">
                  {uploadError}
                </p>
              ) : null}
            </div>
          </div>

          {editingNickname ? (
            <form
              className="mypage-profile__edit"
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
          ) : null}
        </article>

        {/* 계정 정보 카드 — 실명은 여기서만 노출(계약·정산 전용) */}
        <article className="mypage-profile__card">
          <h2 className="mypage-profile__card-title">계정 정보</h2>
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
          <p className="mypage-profile__note">
            실명은 다른 사용자에게 공개되지 않고 계약·정산에만 사용돼요.
          </p>
        </article>

        <SettlementAccountCard />
        <MarketingConsentCard />
      </div>
    </section>
  );
}
