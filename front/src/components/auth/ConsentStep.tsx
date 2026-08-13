"use client";

import { useState } from "react";
import LegalDocBody from "@/components/legal/LegalDocBody";
import { PRIMARY_CTA } from "@/lib/button-styles";
import { PRIVACY_DOC } from "@/lib/legal/privacy";
import { TERMS_DOC } from "@/lib/legal/terms";
import type { LegalDoc } from "@/lib/legal/types";

type ConsentKey = "age" | "terms" | "privacy" | "marketing";

type ConsentItem = {
  key: ConsentKey;
  label: string;
  required: boolean;
  /** 전문이 있는 항목은 스텝 안에서 펼쳐볼 수 있다 */
  doc?: LegalDoc;
  description?: string;
};

const CONSENT_ITEMS: ConsentItem[] = [
  { key: "age", label: "만 14세 이상입니다", required: true },
  { key: "terms", label: "이용약관 동의", required: true, doc: TERMS_DOC },
  {
    key: "privacy",
    label: "개인정보 수집·이용 동의",
    required: true,
    doc: PRIVACY_DOC,
  },
  {
    key: "marketing",
    label: "마케팅 정보 수신 동의",
    required: false,
    description: "이벤트·혜택 소식을 문자·알림톡으로 받아볼 수 있어요.",
  },
];

/**
 * 회원가입 스텝 1: 약관 동의.
 * 필수 항목(만 14세·이용약관·개인정보)을 모두 체크해야 다음 스텝(본인인증)으로
 * 넘어갈 수 있고, 마케팅 수신(선택) 여부는 onAgreed로 전달한다.
 * 스타일: styles/pages/auth.css
 */
export default function ConsentStep({
  onAgreed,
}: {
  onAgreed: (consent: { marketing: boolean }) => void;
}) {
  const [checked, setChecked] = useState<Record<ConsentKey, boolean>>({
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const allChecked = CONSENT_ITEMS.every((item) => checked[item.key]);
  const requiredChecked = CONSENT_ITEMS.filter((item) => item.required).every(
    (item) => checked[item.key],
  );

  function toggleAll() {
    const next = !allChecked;
    setChecked({ age: next, terms: next, privacy: next, marketing: next });
  }

  function toggle(key: ConsentKey) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="consent-step">
      <label className="consent-step__all">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={toggleAll}
          className="consent-step__checkbox"
        />
        전체 동의
      </label>

      <ul className="consent-step__items">
        {CONSENT_ITEMS.map((item) => (
          <li key={item.key}>
            <label className="consent-step__item-label">
              <input
                type="checkbox"
                checked={checked[item.key]}
                onChange={() => toggle(item.key)}
                className="consent-step__checkbox consent-step__checkbox--item"
              />
              <span>
                <span
                  className={`consent-step__tag consent-step__tag--${
                    item.required ? "required" : "optional"
                  }`}
                >
                  [{item.required ? "필수" : "선택"}]
                </span>{" "}
                {item.label}
                {item.description && (
                  <span className="consent-step__desc">
                    {item.description}
                  </span>
                )}
              </span>
            </label>

            {item.doc && (
              <details className="consent-step__details">
                <summary className="consent-step__summary">전문 보기</summary>
                <div className="consent-step__doc">
                  <LegalDocBody doc={item.doc} compact />
                </div>
              </details>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onAgreed({ marketing: checked.marketing })}
        disabled={!requiredChecked}
        className={`consent-step__submit ${PRIMARY_CTA}`}
      >
        동의하고 계속하기
      </button>
    </div>
  );
}
