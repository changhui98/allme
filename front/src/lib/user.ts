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

/** 계정 역할 — 백엔드 Role enum name과의 계약(다중 보유 가능) */
export type UserRole = "USER" | "PROVIDER" | "MANAGER" | "ADMIN";

export type LoginUserResult = {
  loginId: string;
  name: string;
  /** 프로필 이미지 서빙 경로(/images/...) — API_BASE_URL을 붙여 사용. 미설정이면 null */
  profileImageUrl: string | null;
  roles: UserRole[];
};

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

/** 프로필 이미지 업로드(교체). 성공 시 갱신된 회원 요약을 반환한다. */
export async function uploadProfileImage(
  file: File,
): Promise<LoginUserResult> {
  const formData = new FormData();
  formData.append("image", file);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/users/me/profile-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => undefined)) as { code?: string; message?: string } | undefined;
    throw new ApiError(
      body?.message ?? "프로필 이미지 업로드에 실패했습니다.",
      body?.code,
    );
  }
  return res.json();
}

/** 회원탈퇴 — 비밀번호 재확인(U013) 후 soft delete + 개인정보 익명화. 성공 시 세션도 무효화된다. */
export async function withdrawUser(password: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => undefined)) as { code?: string; message?: string } | undefined;
    throw new ApiError(body?.message ?? "회원탈퇴에 실패했습니다.", body?.code);
  }
}

/** 로그아웃 — 세션 무효화. 호출 후에는 풀 리로드로 useMe 캐시를 초기화할 것. */
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/users/logout`, {
      method: "POST",
      credentials: "include",
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
