/**
 * user 도메인 API 클라이언트. (identity-verification.ts와 같은 fetch 패턴)
 */

import { API_BASE_URL, ApiError } from "@/lib/api";

/** 아이디 사용 가능 여부를 확인한다. 형식 오류(U006) 등은 서버 메시지로 throw. */
export async function checkLoginIdAvailability(
  loginId: string,
): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE_URL}/api/users/login-id/availability?loginId=${encodeURIComponent(loginId)}`,
    );
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!res.ok) {
    const message = await res
      .json()
      .then((body: { message?: string }) => body.message)
      .catch(() => undefined);
    throw new Error(message ?? "아이디 확인에 실패했습니다.");
  }
  const body = (await res.json()) as { available: boolean };
  return body.available;
}

export type JoinUserInput = {
  identityVerificationId: string;
  loginId: string;
  password: string;
  marketingConsent: boolean;
};

export type LoginUserResult = {
  loginId: string;
  name: string;
};

/**
 * 로그인. 성공 시 백엔드가 세션 쿠키(JSESSIONID)를 내려주므로
 * credentials: "include"가 필수다 (다른 오리진 간 쿠키 수신·전송 허용).
 */
export async function loginUser(
  loginId: string,
  password: string,
): Promise<LoginUserResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ loginId, password }),
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => undefined)) as { code?: string; message?: string } | undefined;
    throw new ApiError(body?.message ?? "로그인에 실패했습니다.", body?.code);
  }
  return res.json();
}

/**
 * 세션 확인 — 로그인 상태면 회원 요약, 아니면 null.
 * 401(U011)은 "비로그인"이라는 정상 상태이므로 에러로 던지지 않는다.
 */
export async function fetchMe(): Promise<LoginUserResult | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/users/me`, {
      credentials: "include",
    });
  } catch {
    // 서버 접속 불가도 헤더 입장에선 비로그인과 동일하게 취급
    return null;
  }
  if (!res.ok) return null;
  return res.json();
}

/**
 * 회원가입. 이름 등 개인정보는 보내지 않는다 —
 * 백엔드가 identityVerificationId로 포트원을 재조회해 확보·암호화 저장한다.
 */
export async function joinUser(input: JoinUserInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => undefined)) as { code?: string; message?: string } | undefined;
    throw new ApiError(body?.message ?? "회원가입에 실패했습니다.", body?.code);
  }
}
