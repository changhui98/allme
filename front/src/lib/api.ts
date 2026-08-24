/**
 * 백엔드 API 공통 유틸 — 베이스 URL·에러 타입·공통 요청 헬퍼·세션 만료 전역 신호.
 * 도메인별 클라이언트(user.ts, admin.ts, identity-verification.ts)가 여기서 import한다.
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

/** 세션 만료 에러코드 — 백엔드 UserErrorCode.UNAUTHORIZED(U011)와의 계약 */
export const SESSION_EXPIRED_CODE = "U011";

/* ---- 세션 만료 전역 신호 (모듈 레벨 emitter — SSR 안전: 브라우저 전역 미참조) ---- */

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();
/**
 * 발신 후 true 고정 — 동시 다발 401 dedupe + 구독 전 발신 재생(replay)용.
 * 리셋이 없는 이유: 모달의 모든 탈출 경로가 풀 내비게이션이라 모듈이 재평가된다.
 */
let sessionExpiredSignaled = false;

export function signalSessionExpired(): void {
  if (sessionExpiredSignaled) return;
  sessionExpiredSignaled = true;
  sessionExpiredListeners.forEach((listener) => listener());
}

/** 세션 만료 신호 구독 — 구독 시점에 이미 발신됐으면 즉시 재생한다. 반환값은 해제 함수. */
export function subscribeSessionExpired(
  listener: SessionExpiredListener,
): () => void {
  sessionExpiredListeners.add(listener);
  if (sessionExpiredSignaled) listener();
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

/* ---- 공통 요청 헬퍼 ---- */

export type RequestOptions = RequestInit & {
  /** !ok인데 서버가 message를 안 준 경우의 엔드포인트별 대체 문구 */
  fallbackMessage?: string;
  /**
   * 401 U011 감지 시 전역 세션 만료 신호 발신 여부(기본 true).
   * 비로그인이 정상 상태인 확인용 호출(fetchMe·logout)만 false로 끈다.
   */
  notifySessionExpired?: boolean;
};

/**
 * 공통 fetch 래퍼 — credentials 기본 포함, 서버 ErrorResponse를 ApiError로 변환.
 * 세션 만료(401 + U011)를 감지하면 전역 신호를 발신한 뒤 그대로 throw한다
 * (호출부의 인라인 에러 처리는 유지되고, 전역 모달이 그 위를 덮는다).
 */
export async function request<T>(
  path: string,
  {
    fallbackMessage = "요청에 실패했습니다.",
    notifySessionExpired = true,
    ...init
  }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...init,
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => undefined)) as { code?: string; message?: string } | undefined;
    if (
      notifySessionExpired &&
      res.status === 401 &&
      body?.code === SESSION_EXPIRED_CODE
    ) {
      signalSessionExpired();
    }
    throw new ApiError(body?.message ?? fallbackMessage, body?.code);
  }
  // 승인/반려 등 본문 없는 200/204 응답 대응
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
