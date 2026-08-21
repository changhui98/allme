"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/auth/FormField";
import { BANKS } from "@/lib/banks";
import {
  type SettlementAccount,
  fetchSettlementAccount,
  saveSettlementAccount,
} from "@/lib/user";

/**
 * 정산 계좌 카드 — 조회(마스킹)·등록·변경(전체 재입력).
 * 평문 계좌번호는 서버가 내리지 않으므로 변경 폼은 항상 빈 값에서 시작한다.
 * 저장 성공 시 응답(마스킹)으로 로컬만 갱신한다(리로드 불필요).
 * 스타일: styles/pages/mypage.css (mypage-profile·mypage-account)
 */
export default function SettlementAccountCard() {
  const [account, setAccount] = useState<SettlementAccount | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSettlementAccount()
      .then((result) => {
        if (cancelled) return;
        setAccount(result);
        setLoaded(true);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLoadError(
          e instanceof Error ? e.message : "정산 계좌 조회에 실패했습니다.",
        );
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openEdit = () => {
    setBank(account?.bank ?? "");
    setAccountNumber("");
    setAccountHolder(account?.accountHolder ?? "");
    setSaveError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (saving) return;
    const number = accountNumber.replace(/-/g, "").trim();
    const holder = accountHolder.trim();
    // 백엔드 U016과 동일 기준의 선제 검증 — 통과 못 하면 요청 없이 인라인 안내
    if (!bank) {
      setSaveError("은행을 선택해주세요.");
      return;
    }
    if (!/^\d{8,16}$/.test(number)) {
      setSaveError("계좌번호는 숫자 8~16자리로 입력해주세요.");
      return;
    }
    if (!holder) {
      setSaveError("예금주를 입력해주세요.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await saveSettlementAccount({
        bank,
        accountNumber: number,
        accountHolder: holder,
      });
      setAccount(saved);
      setEditing(false);
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "정산 계좌 저장에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="mypage-profile__card">
      <h2 className="mypage-profile__card-title">정산 계좌</h2>

      {!loaded ? (
        <p className="mypage-profile__note">불러오는 중...</p>
      ) : loadError ? (
        <p className="mypage-profile__error" role="alert">
          {loadError}
        </p>
      ) : editing ? (
        <form
          className="mypage-account__form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className="mypage-account__field">
            <label htmlFor="settlement-bank" className="mypage-account__label">
              은행
            </label>
            <select
              id="settlement-bank"
              value={bank}
              onChange={(e) => {
                setBank(e.target.value);
                setSaveError(null);
              }}
              className="mypage-account__select"
            >
              <option value="">은행 선택</option>
              {BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <FormField
            id="settlement-account-number"
            label="계좌번호 (숫자만)"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={accountNumber}
            onChange={(value) => {
              setAccountNumber(value);
              setSaveError(null);
            }}
          />
          <FormField
            id="settlement-account-holder"
            label="예금주"
            type="text"
            autoComplete="off"
            value={accountHolder}
            onChange={(value) => {
              setAccountHolder(value);
              setSaveError(null);
            }}
            error={saveError ?? undefined}
          />
          <div className="mypage-profile__edit-actions">
            <button
              type="submit"
              disabled={saving}
              className="btn btn--primary mypage-profile__edit-btn"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="btn btn--outline mypage-profile__edit-btn"
            >
              취소
            </button>
          </div>
        </form>
      ) : account ? (
        <>
          <dl className="mypage-profile__facts">
            <div className="mypage-profile__fact">
              <dt className="mypage-profile__fact-label">은행</dt>
              <dd className="mypage-profile__fact-value">{account.bankName}</dd>
            </div>
            <div className="mypage-profile__fact">
              <dt className="mypage-profile__fact-label">계좌번호</dt>
              <dd className="mypage-profile__fact-value">
                {account.accountNumberMasked}
              </dd>
            </div>
            <div className="mypage-profile__fact">
              <dt className="mypage-profile__fact-label">예금주</dt>
              <dd className="mypage-profile__fact-value">
                {account.accountHolder}
              </dd>
            </div>
          </dl>
          <div className="mypage-profile__actions">
            <button
              type="button"
              onClick={openEdit}
              className="mypage-profile__text-btn"
            >
              계좌 변경
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mypage-profile__note">
            판매 대금을 받으려면 정산 계좌가 필요해요. 계좌 정보는 암호화되어
            안전하게 보관돼요.
          </p>
          <button
            type="button"
            onClick={openEdit}
            className="btn btn--primary mypage-profile__edit-btn mypage-account__register"
          >
            계좌 등록
          </button>
        </>
      )}
    </article>
  );
}
