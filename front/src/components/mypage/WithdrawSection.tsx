"use client";

import Link from "next/link";
import { useState } from "react";
import FormField from "@/components/auth/FormField";
import Modal from "@/components/common/Modal";
import { useMe } from "@/lib/use-me";
import { displayName, withdrawUser } from "@/lib/user";

type ConsentKey = "notice" | "deletion";

const CONSENT_ITEMS: { key: ConsentKey; label: string }[] = [
  { key: "notice", label: "위 유의사항을 모두 확인했으며 이에 동의합니다" },
  { key: "deletion", label: "계정 정보 삭제에 동의합니다" },
];

/**
 * 회원탈퇴 본문 — 리텐션 멘트 → 유의사항 → 동의 체크 2개(모두 필수) → 비밀번호 재확인 → 탈퇴.
 * 동의를 모두 체크하고 비밀번호를 입력해야 탈퇴 버튼이 활성화되며(실제 검증은 백엔드 U013),
 * 성공 시 완료 모달 후 홈으로 보낸다.
 * 체크박스는 ConsentStep과 같은 패턴(네이티브 input 숨김 + 원형 커스텀 체크).
 * 셸(MypageShell)이 세션을 보장하므로 me 유무만 가드한다.
 * 스타일: styles/pages/mypage.css (.withdraw-page·.withdraw-consent)
 */
export default function WithdrawSection() {
  const { me } = useMe();
  const [checked, setChecked] = useState<Record<ConsentKey, boolean>>({
    notice: false,
    deletion: false,
  });
  const [password, setPassword] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!me) return null;

  const allChecked = CONSENT_ITEMS.every((item) => checked[item.key]);
  const canSubmit = allChecked && password !== "";

  const toggle = (key: ConsentKey) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleWithdraw = async () => {
    if (!canSubmit || withdrawing) return;
    setWithdrawing(true);
    setError(null);
    try {
      await withdrawUser(password);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "회원탈퇴에 실패했습니다.");
      setWithdrawing(false);
    }
  };

  const goHome = () => window.location.assign("/");

  return (
    <>
      <h1 className="mypage-page__title">올미와 이별하시는 건가요?</h1>
      <p className="mypage-page__subtitle">
        {displayName(me)}님, 탈퇴하기 전에 아래 내용을 꼭 확인해주세요.
      </p>

      <section aria-label="탈퇴 유의사항" className="mypage-section">
        <h2 className="mypage-section__title">탈퇴하면 이렇게 돼요</h2>
        <ul className="withdraw-page__notices">
          <li className="withdraw-page__notice">
            계정 정보(이름·본인인증 정보·휴대폰번호)가 즉시 삭제되며 복구할 수
            없어요.
          </li>
          <li className="withdraw-page__notice">
            사용하던 아이디({me.loginId})로는 다시 가입할 수 없어요.
          </li>
          <li className="withdraw-page__notice">
            프로필 사진 등 등록한 파일이 함께 삭제돼요.
          </li>
          <li className="withdraw-page__notice">
            진행 중인 거래가 있다면 마무리한 뒤에 탈퇴해주세요.
          </li>
        </ul>
      </section>

      <div className="withdraw-consent">
        {CONSENT_ITEMS.map((item) => (
          <label key={item.key} className="withdraw-consent__label">
            <input
              type="checkbox"
              checked={checked[item.key]}
              onChange={() => toggle(item.key)}
              className="withdraw-consent__checkbox"
            />
            <span aria-hidden="true" className="withdraw-consent__check">
              <CheckIcon />
            </span>
            {item.label}
          </label>
        ))}
      </div>

      {/* 본인 확인 — 비밀번호 재입력 (검증은 탈퇴 API가 수행) */}
      <div className="withdraw-page__password">
        <FormField
          id="withdraw-password"
          label="비밀번호 확인"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
      </div>

      {error ? (
        <p className="withdraw-page__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="withdraw-page__actions">
        <Link href="/mypage" className="btn btn--primary withdraw-page__stay">
          계속 이용하기
        </Link>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={!canSubmit || withdrawing}
          className="btn btn--danger withdraw-page__submit"
        >
          {withdrawing ? "처리 중..." : "탈퇴하기"}
        </button>
      </div>

      <Modal
        open={done}
        title="탈퇴 완료"
        onClose={goHome}
        actions={
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={goHome}
          >
            확인
          </button>
        }
      >
        탈퇴가 완료되었습니다. 그동안 올미를 이용해주셔서 감사합니다.
      </Modal>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="withdraw-consent__check-icon"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
