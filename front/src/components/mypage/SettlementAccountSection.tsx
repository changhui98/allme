"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/auth/FormField";
import BankPickerModal from "@/components/mypage/BankPickerModal";
import { ApiError } from "@/lib/api";
import { BANKS, bankIconSrc } from "@/lib/banks";
import {
  type SettlementAccount,
  fetchSettlementAccount,
  saveSettlementAccount,
  verifySettlementAccount,
} from "@/lib/user";

/** 백엔드 U020 — 세션의 계좌 인증 기록이 없거나 만료·불일치 */
const NOT_VERIFIED_CODE = "U020";

/**
 * 정산 계좌 섹션 — 조회·등록·변경.
 * 예금주는 직접 입력하지 않는다: 은행+계좌번호로 "계좌 인증"(포트원 예금주 조회)을 거치면
 * 실명이 표시되고, 그 상태에서만 저장할 수 있다. 은행·계좌번호를 바꾸면 인증이 무효화된다.
 * 조회 응답의 계좌번호는 마스킹(앞 3·뒤 4자리)이라 변경 시 은행만 프리필하고 번호는 재입력한다.
 * 스타일: styles/pages/mypage.css (mypage-group·mypage-rows·mypage-account)
 */
export default function SettlementAccountSection() {
  const [account, setAccount] = useState<SettlementAccount | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [bank, setBank] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  /** 계좌 인증으로 조회된 예금주 — null이면 미인증(저장 불가) */
  const [verifiedHolder, setVerifiedHolder] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
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
    // 계좌번호는 마스킹 응답이라 프리필 불가 — 재입력(인증도 항상 새로 필요)
    setAccountNumber("");
    setVerifiedHolder(null);
    setSaveError(null);
    setEditing(true);
  };

  /** 백엔드 U016과 동일 기준의 선제 검증 — 통과 못 하면 요청 없이 인라인 안내 */
  const validatedInput = () => {
    const number = accountNumber.replace(/-/g, "").trim();
    if (!bank) {
      setSaveError("은행을 선택해주세요.");
      return null;
    }
    if (!/^\d{8,16}$/.test(number)) {
      setSaveError("계좌번호는 숫자 8~16자리로 입력해주세요.");
      return null;
    }
    return { bank, accountNumber: number };
  };

  const handleVerify = async () => {
    if (verifying || saving) return;
    const input = validatedInput();
    if (!input) return;
    setVerifying(true);
    setSaveError(null);
    try {
      setVerifiedHolder(await verifySettlementAccount(input));
    } catch (e) {
      setVerifiedHolder(null);
      setSaveError(
        e instanceof Error ? e.message : "계좌 인증에 실패했습니다.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    if (saving || verifying) return;
    const input = validatedInput();
    if (!input) return;
    if (verifiedHolder === null) {
      setSaveError("계좌 인증을 먼저 진행해주세요.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await saveSettlementAccount(input);
      setAccount(saved);
      setEditing(false);
    } catch (e) {
      // 세션 인증 기록 만료·불일치(다른 탭에서 재인증 등) — 재인증 유도
      if (e instanceof ApiError && e.code === NOT_VERIFIED_CODE) {
        setVerifiedHolder(null);
      }
      setSaveError(
        e instanceof Error ? e.message : "정산 계좌 저장에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedBank = BANKS.find((b) => b.code === bank);

  return (
    <section className="mypage-group" aria-labelledby="settlement-title">
      <div className="mypage-group__header">
        <h2 id="settlement-title" className="mypage-group__title">
          정산 계좌
        </h2>
        {loaded && !loadError && account && !editing ? (
          <div className="mypage-group__action">
            <button
              type="button"
              onClick={openEdit}
              className="mypage-profile__text-btn"
            >
              계좌 변경
            </button>
          </div>
        ) : null}
      </div>

      {!loaded ? (
        <p className="mypage-group__note">불러오는 중...</p>
      ) : loadError ? (
        <p className="mypage-group__error" role="alert">
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
            <span id="settlement-bank-label" className="mypage-account__label">
              은행
            </span>
            <button
              type="button"
              aria-labelledby="settlement-bank-label"
              aria-haspopup="dialog"
              onClick={() => setPickerOpen(true)}
              className={`mypage-account__bank-btn${
                selectedBank ? "" : " mypage-account__bank-btn--placeholder"
              }`}
            >
              {selectedBank ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 브랜드 SVG, 최적화 불필요 */}
                  <img
                    src={bankIconSrc(selectedBank.code)}
                    alt=""
                    className="mypage-account__bank-btn-icon"
                    width={24}
                    height={24}
                  />
                  {selectedBank.name}
                </>
              ) : (
                "은행 선택"
              )}
              <ChevronDownIcon />
            </button>
          </div>
          <BankPickerModal
            open={pickerOpen}
            value={bank}
            onSelect={(code) => {
              setBank(code);
              setVerifiedHolder(null); // 입력 변경 → 인증 무효화
              setSaveError(null);
            }}
            onClose={() => setPickerOpen(false)}
          />
          <FormField
            id="settlement-account-number"
            label="계좌번호 (숫자만)"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={accountNumber}
            onChange={(value) => {
              setAccountNumber(value);
              setVerifiedHolder(null); // 입력 변경 → 인증 무효화
              setSaveError(null);
            }}
          />
          {verifiedHolder !== null ? (
            <div className="mypage-account__holder" aria-live="polite">
              <CheckIcon />
              <span className="mypage-account__holder-label">예금주</span>
              <span className="mypage-account__holder-name">
                {verifiedHolder}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={verifying || saving}
              className="btn btn--outline mypage-profile__edit-btn mypage-account__verify-btn"
            >
              {verifying ? "인증 중..." : "계좌 인증"}
            </button>
          )}
          {saveError ? (
            <p className="mypage-group__error" role="alert">
              {saveError}
            </p>
          ) : null}
          <div className="mypage-profile__edit-actions">
            <button
              type="submit"
              disabled={saving || verifying || verifiedHolder === null}
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
        <dl className="mypage-rows">
          <div className="mypage-row">
            <dt className="mypage-row__label">은행</dt>
            <dd className="mypage-row__value mypage-account__fact-bank">
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 브랜드 SVG, 최적화 불필요 */}
              <img
                src={bankIconSrc(account.bank)}
                alt=""
                className="mypage-account__bank-btn-icon"
                width={20}
                height={20}
              />
              {account.bankName}
            </dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">계좌번호</dt>
            <dd className="mypage-row__value">{account.accountNumberMasked}</dd>
          </div>
          <div className="mypage-row">
            <dt className="mypage-row__label">예금주</dt>
            <dd className="mypage-row__value">{account.accountHolder}</dd>
          </div>
        </dl>
      ) : (
        <>
          <p className="mypage-group__note">
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
    </section>
  );
}

/* 계좌 인증 완료 표시 */
function CheckIcon() {
  return (
    <svg
      className="mypage-account__holder-check"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 8.5 3.5 3.5L13 5" />
    </svg>
  );
}

/* 은행 선택 트리거의 펼침 표시 — select의 네이티브 화살표 대체 */
function ChevronDownIcon() {
  return (
    <svg
      className="mypage-account__bank-btn-chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}
