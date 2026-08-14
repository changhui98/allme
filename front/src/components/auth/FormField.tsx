"use client";

import { useState } from "react";

/**
 * 로그인·회원가입 폼의 박스형 인풋. (클라이언트 컴포넌트)
 * 정적 라벨(위) + 라운드 박스 인풋(아래) 구조로, 포커스 시 포인트색 보더 + 링이 뜬다.
 * password 타입은 우측의 눈 모양 토글로 표시/숨김을 전환한다(이 상태 때문에 클라이언트).
 * 스타일: styles/pages/auth.css
 */
type FormFieldProps = {
  /** input의 id이자 name — 라벨 연결(htmlFor)에 그대로 쓰인다 */
  id: string;
  label: string;
  type: "text" | "email" | "password";
  /** 브라우저 자동완성 힌트 (예: email, current-password, new-password) */
  autoComplete: string;
  placeholder?: string;
  /** 초기값 (비제어 유지) */
  defaultValue?: string;
  /** 본인인증 결과 프리필처럼 수정 불가로 보여줄 때 */
  readOnly?: boolean;
};

export default function FormField({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  defaultValue,
  readOnly,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      <div className="form-field__box">
        <input
          id={id}
          name={id}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={defaultValue}
          readOnly={readOnly}
          className={`form-field__input${
            isPassword ? " form-field__input--password" : ""
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            className="form-field__toggle"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="form-field__toggle-icon"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="form-field__toggle-icon"
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
