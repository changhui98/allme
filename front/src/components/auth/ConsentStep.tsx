"use client";

import { useState } from "react";
import LegalDocBody from "@/components/legal/LegalDocBody";
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
    <div className="flex flex-col">
      <label className="flex items-center gap-2 border-b border-stone-200 pb-4 font-semibold dark:border-stone-700">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={toggleAll}
          className="accent-primary"
        />
        전체 동의
      </label>

      <ul className="mt-4 flex flex-col gap-3">
        {CONSENT_ITEMS.map((item) => (
          <li key={item.key}>
            <label className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
              <input
                type="checkbox"
                checked={checked[item.key]}
                onChange={() => toggle(item.key)}
                className="mt-0.5 accent-primary"
              />
              <span>
                <span
                  className={
                    item.required
                      ? "font-medium text-primary"
                      : "text-stone-400 dark:text-stone-500"
                  }
                >
                  [{item.required ? "필수" : "선택"}]
                </span>{" "}
                {item.label}
                {item.description && (
                  <span className="mt-0.5 block text-xs text-stone-400 dark:text-stone-500">
                    {item.description}
                  </span>
                )}
              </span>
            </label>

            {item.doc && (
              <details className="mt-1 pl-6">
                <summary className="cursor-pointer text-xs text-stone-400 underline hover:text-foreground dark:text-stone-500">
                  전문 보기
                </summary>
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-stone-200 p-4 dark:border-stone-700">
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
        className="mt-8 w-full rounded-lg bg-primary py-3 text-[15px] font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        동의하고 계속하기
      </button>
    </div>
  );
}
