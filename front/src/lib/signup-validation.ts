/**
 * 회원가입 입력 검증 규칙. (순수 함수 — 서버/클라 공용 가능)
 * 아이디·비밀번호 규칙은 추후 가입(join) API의 백엔드 검증과 반드시 동일하게 유지할 것.
 */

/** 백엔드 UserService의 LOGIN_ID_PATTERN과 동일해야 한다 */
export const LOGIN_ID_PATTERN = /^[a-z0-9]{4,20}$/;

export const LOGIN_ID_RULE_MESSAGE =
  "영문 소문자와 숫자를 사용해 4~20자로 입력해주세요.";

export type PasswordRule = {
  id: "length" | "upper" | "lower" | "digit" | "special";
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "8자 이상", test: (pw) => pw.length >= 8 },
  { id: "upper", label: "대문자 포함", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lower", label: "소문자 포함", test: (pw) => /[a-z]/.test(pw) },
  { id: "digit", label: "숫자 포함", test: (pw) => /[0-9]/.test(pw) },
  {
    id: "special",
    label: "특수문자 포함",
    // 영숫자·공백 외 전부를 특수문자로 인정 — 목록 열거식보다 사용자에게 관대한 기준
    test: (pw) => /[^A-Za-z0-9\s]/.test(pw),
  },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
