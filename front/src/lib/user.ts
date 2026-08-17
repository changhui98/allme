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
