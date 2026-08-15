"use client";

import { PASSWORD_RULES } from "@/lib/signup-validation";

/**
 * 비밀번호 규칙 실시간 체크리스트 — 입력할 때마다 규칙별 충족 여부를 색·아이콘으로 표시.
 * 스타일: styles/pages/auth.css (.password-checklist)
 */
export default function PasswordChecklist({
  password,
  id,
}: {
  password: string;
  id: string;
}) {
  return (
    <ul id={id} aria-live="polite" className="password-checklist">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={`password-checklist__item${met ? " is-met" : ""}`}
          >
            {met ? <CheckIcon /> : <DotIcon />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="password-checklist__icon"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="password-checklist__icon"
    >
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
