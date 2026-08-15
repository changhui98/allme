"use client";

import { useState } from "react";

/**
 * 로그인·회원가입 폼의 박스형 인풋. (클라이언트 컴포넌트)
 * 정적 라벨(위) + 라운드 박스 인풋(아래) 구조로, 포커스 시 포인트색 보더 + 링이 뜬다.
 * password 타입은 우측의 눈 모양 토글로 표시/숨김을 전환한다(이 상태 때문에 클라이언트).
 * value/onChange를 주면 제어 컴포넌트로 동작하고(이때 defaultValue는 넘기지 말 것),
 * error/success는 박스 아래 한 줄 메시지, trailing은 박스 우측 슬롯(중복확인 버튼 등).
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
  /** 초기값 (비제어 사용처용 — value와 함께 쓰지 말 것) */
  defaultValue?: string;
  /** 본인인증 결과 프리필처럼 수정 불가로 보여줄 때 */
  readOnly?: boolean;
  /** 제어값 — onChange와 함께 전달 */
  value?: string;
  onChange?: (value: string) => void;
  /** 박스 우측 슬롯 (password 토글과 배타적 사용 전제) */
  trailing?: React.ReactNode;
  /** 박스 아래 에러 메시지 — 인풋에 is-invalid·aria-invalid도 함께 적용 */
  error?: string;
  /** 박스 아래 성공 메시지 (error가 있으면 error 우선) */
  success?: string;
  /** 외부 설명 요소(비밀번호 체크리스트 등)를 aria-describedby로 연결 */
  describedById?: string;
};

export default function FormField({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  defaultValue,
  readOnly,
  value,
  onChange,
  trailing,
  error,
  success,
  describedById,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const message = error ?? success;
  const messageId = message ? `${id}-message` : undefined;
  const describedBy =
    [messageId, describedById].filter(Boolean).join(" ") || undefined;

  const inputClassName = [
    "form-field__input",
    isPassword && "form-field__input--password",
    trailing && "form-field__input--trailing",
    error && "is-invalid",
  ]
    .filter(Boolean)
    .join(" ");

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
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={inputClassName}
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
        {trailing}
      </div>
      {message && (
        <p
          id={messageId}
          role={error ? "alert" : "status"}
          className={`form-field__message form-field__message--${
            error ? "error" : "success"
          }`}
        >
          {message}
        </p>
      )}
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
