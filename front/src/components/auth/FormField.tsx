"use client";

import { useState } from "react";

/**
 * 로그인·회원가입 폼의 박스형 인풋 + 플로팅 라벨. (클라이언트 컴포넌트)
 * 빈 상태에선 라벨이 인풋 안(placeholder 자리)에 있다가, 포커스되거나 값이 있으면
 * 박스 테두리 왼쪽 위로 떠올라 걸친다(is-floated 클래스, notched outline 스타일).
 * placeholder는 라벨과 자리가 겹치므로 포커스 중에만 실제로 노출한다.
 * password 타입은 우측의 눈 모양 토글로 표시/숨김을 전환한다.
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
  /** 모바일 키패드 힌트 (계좌번호 등 숫자 입력 필드용) */
  inputMode?: "numeric";
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
  inputMode,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  // 비제어 사용처(defaultValue)의 값 유무 판정용 — 제어면 value로 직접 판정
  const [innerHasValue, setInnerHasValue] = useState(() =>
    Boolean(defaultValue),
  );
  const hasValue = value !== undefined ? value !== "" : innerHasValue;
  const floated = focused || hasValue;

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
    <div className={`form-field${floated ? " is-floated" : ""}`}>
      <div className="form-field__box">
        <input
          id={id}
          name={id}
          type={inputType}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={focused ? placeholder : undefined}
          defaultValue={defaultValue}
          readOnly={readOnly}
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
            else setInnerHasValue(e.target.value !== "");
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={inputClassName}
        />
        {/* 라벨은 absolute 플로팅 — input 뒤에 둬야 :focus/:autofill ~ 라벨 셀렉터가 성립 */}
        <label htmlFor={id} className="form-field__label">
          {label}
        </label>
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
