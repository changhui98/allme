/**
 * 포트원 V2 본인인증 클라이언트 유틸. (브라우저 전용)
 * - SDK 창 호출(데스크톱 팝업 / 모바일 redirect)과 백엔드 검증 API 호출을 담당
 * - storeId·channelKey는 NEXT_PUBLIC env — 미설정이면 isPortOneConfigured()로 가드
 * - API Secret을 쓰는 실제 검증은 백엔드(/api/identity-verifications/verify)에서만 수행
 */

export type VerifiedCustomer = {
  name: string;
  birthDate: string;
  phoneNumber: string;
  gender: string;
};

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function isPortOneConfigured(): boolean {
  return Boolean(STORE_ID && CHANNEL_KEY);
}

/**
 * 포트원 본인인증 창을 열고, 완료되면 identityVerificationId를 반환한다.
 * 모바일 등 redirect 방식에서는 반환 전에 페이지가 이탈되고
 * redirectUrl(/signup)의 쿼리 파라미터로 결과가 전달된다.
 */
export async function requestIdentityVerification(): Promise<string> {
  const PortOne = await import("@portone/browser-sdk/v2");

  const response = await PortOne.requestIdentityVerification({
    storeId: STORE_ID!,
    channelKey: CHANNEL_KEY!,
    identityVerificationId: `identity-verification-${crypto.randomUUID()}`,
    redirectUrl: `${window.location.origin}/signup`,
    // 미지정 시 브라우저 기본 위치(왼쪽 위)에 뜬다. 크기는 이니시스 고정값이라 위치만 제어 가능.
    popup: { center: true },
    bypass: {
      // 이니시스 통합인증. 카카오 인증서(CI 미제공) 제외는 이니시스 계약·콘솔의
      // 노출 인증사 설정으로 처리하고, 백엔드도 CI 없는 건은 거부한다(U005).
      inicisUnified: { flgFixedUser: "N" },
    },
  });

  if (!response) {
    throw new Error("본인인증이 완료되지 않았습니다. 다시 시도해주세요.");
  }
  if (response.code !== undefined) {
    throw new Error(response.message ?? "본인인증에 실패했습니다.");
  }
  return response.identityVerificationId;
}

/** 백엔드에 인증 완료 여부를 검증하고 인증된 고객 정보를 받아온다. */
export async function verifyIdentityOnServer(
  identityVerificationId: string,
): Promise<VerifiedCustomer> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/identity-verifications/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identityVerificationId }),
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!res.ok) {
    const message = await res
      .json()
      .then((body: { message?: string }) => body.message)
      .catch(() => undefined);
    throw new Error(message ?? "본인인증 확인에 실패했습니다.");
  }
  return res.json();
}
