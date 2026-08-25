/**
 * 로그인 복귀 경로 — 세션 만료 모달·셸의 비로그인 리다이렉트가 현재 경로를 `?redirect=`로 넘기고,
 * 로그인 성공 시 그 경로로 돌아간다. 오픈 리다이렉트 방지: 같은 오리진의 절대 경로만 허용한다.
 */
export const LOGIN_REDIRECT_PARAM = "redirect";

/** 브라우저의 현재 경로+쿼리 (클라이언트 전용 — effect·이벤트 핸들러 안에서만 호출) */
export function currentPath(): string {
  return window.location.pathname + window.location.search;
}

/**
 * 쿼리로 받은 복귀 경로 검증 — "/"로 시작하는 같은 오리진 경로만 통과.
 * "//evil.com"·"/\\evil.com"(프로토콜 상대 URL)·절대 URL·로그인/가입 자신은 "/"로 대체한다.
 */
export function safeRedirectPath(
  raw: string | string[] | undefined | null,
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  const pathname = value.split("?")[0];
  if (pathname === "/login" || pathname === "/signup") return "/";
  return value;
}

/** /login?redirect=<경로>. 복귀 대상이 없거나 안전하지 않으면(홈이면) 그냥 /login */
export function loginHref(returnTo?: string): string {
  const safe = safeRedirectPath(returnTo);
  if (safe === "/") return "/login";
  return `/login?${LOGIN_REDIRECT_PARAM}=${encodeURIComponent(safe)}`;
}
