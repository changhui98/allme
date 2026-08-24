/**
 * user 도메인 API 클라이언트 — 공통 요청은 lib/api의 request()를 사용한다.
 */

import { request } from "@/lib/api";

/** 아이디 사용 가능 여부를 확인한다. 형식 오류(U006) 등은 서버 메시지로 throw. */
export async function checkLoginIdAvailability(
  loginId: string,
): Promise<boolean> {
  const body = await request<{ available: boolean }>(
    `/api/users/login-id/availability?loginId=${encodeURIComponent(loginId)}`,
    { fallbackMessage: "아이디 확인에 실패했습니다." },
  );
  return body.available;
}

export type JoinUserInput = {
  identityVerificationId: string;
  loginId: string;
  password: string;
  marketingConsent: boolean;
};

/** 계정 역할 — 백엔드 Role enum name과의 계약(다중 보유 가능) */
export type UserRole = "USER" | "PROVIDER" | "MANAGER" | "ADMIN";

export type LoginUserResult = {
  loginId: string;
  /** 실명(본인인증 확보 값) — 내 정보·계약·정산에만 표시 */
  name: string;
  /** 대외 표시명(랜덤 3단어 닉네임, 변경 가능) */
  nickname: string;
  /** 프로필 이미지 서빙 경로(/images/...) — API_BASE_URL을 붙여 사용. 미설정이면 null */
  profileImageUrl: string | null;
  roles: UserRole[];
  marketingConsent: boolean;
};

/** 대외 표시명 — 닉네임 우선, 닉네임 없는 구버전 응답은 실명으로 방어 */
export function displayName(me: LoginUserResult): string {
  return me.nickname || me.name;
}

/**
 * 역할 보유 여부 — 메뉴 노출·페이지 가드 등 프론트 분기용(실질 보호는 백엔드 인가).
 * roles까지 옵셔널 체이닝하는 이유: roles 필드가 없는 구버전 백엔드 응답에도 죽지 않기 위함.
 */
export function hasRole(
  me: LoginUserResult | null,
  role: UserRole,
): boolean {
  return me?.roles?.includes(role) ?? false;
}

/**
 * 로그인. 성공 시 백엔드가 세션 쿠키(JSESSIONID)를 내려주므로
 * credentials: "include"가 필수다 (request()가 기본으로 포함).
 */
export function loginUser(
  loginId: string,
  password: string,
): Promise<LoginUserResult> {
  return request("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginId, password }),
    fallbackMessage: "로그인에 실패했습니다.",
  });
}

/**
 * 세션 확인 — 로그인 상태면 회원 요약, 아니면 null.
 * 401(U011)은 "비로그인"이라는 정상 상태이므로 에러로 던지지 않고,
 * 전역 세션 만료 신호도 발신하지 않는다(notifySessionExpired: false).
 */
export async function fetchMe(): Promise<LoginUserResult | null> {
  try {
    return await request<LoginUserResult>("/api/users/me", {
      notifySessionExpired: false,
    });
  } catch {
    // 서버 접속 불가도 헤더 입장에선 비로그인과 동일하게 취급
    return null;
  }
}

/** 프로필 이미지 업로드(교체). 성공 시 갱신된 회원 요약을 반환한다. */
export function uploadProfileImage(file: File): Promise<LoginUserResult> {
  const formData = new FormData();
  formData.append("image", file);

  // Content-Type 미지정 — 브라우저가 multipart boundary를 붙이게 둔다
  return request("/api/users/me/profile-image", {
    method: "POST",
    body: formData,
    fallbackMessage: "프로필 이미지 업로드에 실패했습니다.",
  });
}

/** 백엔드 UserService.NICKNAME_PATTERN과 반드시 동일하게 유지할 것: 한글·영문·숫자·공백, 2~24자 */
export const NICKNAME_RULES = {
  pattern: /^[가-힣a-zA-Z0-9 ]{2,24}$/,
  message: "닉네임은 한글·영문·숫자로 2~24자까지 입력할 수 있어요.",
} as const;

/** 닉네임 변경 — 형식 오류 U014(400)·중복 U015(409)는 ApiError.code로 구분한다. */
export function updateNickname(nickname: string): Promise<LoginUserResult> {
  return request("/api/users/me/nickname", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
    fallbackMessage: "닉네임 변경에 실패했습니다.",
  });
}

/** 랜덤 닉네임 제안 — 저장하지 않은 유니크 후보만 받는다("랜덤 다시 뽑기"). */
export async function fetchRandomNickname(): Promise<string> {
  const body = await request<{ nickname: string }>(
    "/api/users/me/nickname/random",
    { fallbackMessage: "닉네임 추천에 실패했습니다." },
  );
  return body.nickname;
}

/** 마케팅 수신 동의 변경 — 서버가 변경 일시도 함께 기록한다. */
export function updateMarketingConsent(
  marketingConsent: boolean,
): Promise<LoginUserResult> {
  return request("/api/users/me/marketing-consent", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marketingConsent }),
    fallbackMessage: "수신 동의 변경에 실패했습니다.",
  });
}

/** 정산 계좌(마스킹 응답) — 평문 계좌번호는 서버가 절대 내리지 않는다(수정은 전체 재입력). */
export type SettlementAccount = {
  /** 백엔드 Bank enum name (lib/banks.ts BANKS.code와 계약) */
  bank: string;
  bankName: string;
  /** "****1234" 형태 마스킹 */
  accountNumberMasked: string;
  accountHolder: string;
};

type SettlementAccountResponse = {
  registered: boolean;
  account: SettlementAccount | null;
};

/** 정산 계좌 조회 — 미등록이면 null. */
export async function fetchSettlementAccount(): Promise<SettlementAccount | null> {
  const body = await request<SettlementAccountResponse>(
    "/api/users/me/settlement-account",
    { fallbackMessage: "정산 계좌 조회에 실패했습니다." },
  );
  return body.registered ? body.account : null;
}

export type SettlementAccountInput = {
  bank: string;
  accountNumber: string;
  accountHolder: string;
};

/** 정산 계좌 등록/수정(upsert) — 형식·은행 오류는 U016(400). 성공 시 마스킹된 계좌를 반환한다. */
export async function saveSettlementAccount(
  input: SettlementAccountInput,
): Promise<SettlementAccount> {
  const body = await request<SettlementAccountResponse>(
    "/api/users/me/settlement-account",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      fallbackMessage: "정산 계좌 저장에 실패했습니다.",
    },
  );
  // upsert 직후 응답이라 항상 registered:true — 방어적으로만 체크
  if (!body.account) throw new Error("정산 계좌 저장에 실패했습니다.");
  return body.account;
}

/** 회원탈퇴 — 비밀번호 재확인(U013) 후 soft delete + 개인정보 익명화. 성공 시 세션도 무효화된다. */
export function withdrawUser(password: string): Promise<void> {
  return request("/api/users/me", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    fallbackMessage: "회원탈퇴에 실패했습니다.",
  });
}

/** 로그아웃 — 세션 무효화. 호출 후에는 풀 리로드로 useMe 캐시를 초기화할 것. */
export async function logoutUser(): Promise<void> {
  try {
    // 세션이 이미 죽어도 204인 멱등 엔드포인트 — 만료 신호도 불필요
    await request<void>("/api/users/logout", {
      method: "POST",
      notifySessionExpired: false,
    });
  } catch {
    // 서버 접속 불가여도 리로드 후 비로그인 취급되므로 조용히 넘어간다
  }
}

/** 로그아웃 후 홈으로 풀 리로드 — useMe 모듈 캐시 초기화 목적 */
export async function logoutAndGoHome(): Promise<void> {
  await logoutUser();
  window.location.assign("/");
}

/**
 * 회원가입. 이름 등 개인정보는 보내지 않는다 —
 * 백엔드가 identityVerificationId로 포트원을 재조회해 확보·암호화 저장한다.
 */
export function joinUser(input: JoinUserInput): Promise<void> {
  return request("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "회원가입에 실패했습니다.",
  });
}
