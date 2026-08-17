/**
 * 백엔드 API 공통 유틸 — 베이스 URL과 에러 타입.
 * 도메인별 클라이언트(user.ts, identity-verification.ts)가 여기서 import한다.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** 에러코드(U007·U009 등)로 분기할 수 있게 서버 ErrorResponse의 code를 보존한 에러 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
