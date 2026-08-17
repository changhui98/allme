/**
 * 포트원 V2 본인인증 클라이언트 유틸. (브라우저 전용)
 * - SDK 창 호출(데스크톱 팝업 / 모바일 redirect)과 백엔드 검증 API 호출을 담당
 * - storeId·channelKey는 NEXT_PUBLIC env — 미설정이면 isPortOneConfigured()로 가드
 * - API Secret을 쓰는 실제 검증은 백엔드(/api/identity-verifications/verify)에서만 수행
 */

import { API_BASE_URL, ApiError } from "@/lib/api";

export type VerifiedCustomer = {
  name: string;
  birthDate: string;
  phoneNumber: string;
  gender: string;
};

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

export function isPortOneConfigured(): boolean {
  return Boolean(STORE_ID && CHANNEL_KEY);
}

/** 이니시스 기본 팝업이 작아, SDK가 여는 창 크기를 이 배율로 확대한다. */
const POPUP_SCALE = 1.3;

/**
 * SDK 호출 동안만 window.open을 래핑해 포트원 팝업("PortOne" 창)의
 * width/height를 확대하고 화면 중앙으로 재배치한다.
 * 팝업 크기는 포트원 서버가 PG별 고정값으로 내려줘 SDK 옵션으로는 못 바꾼다.
 */
async function withEnlargedPopup<T>(fn: () => Promise<T>): Promise<T> {
  const originalOpen = window.open.bind(window);

  window.open = ((url?: string | URL, target?: string, features?: string) => {
    if (target !== "PortOne" || typeof features !== "string") {
      return originalOpen(url, target, features);
    }

    const parsed = new Map(
      features.split(",").map((pair) => {
        const [key, value] = pair.split("=");
        return [key.trim(), value?.trim()] as const;
      }),
    );
    const width = Number(parsed.get("width"));
    const height = Number(parsed.get("height"));
    if (width > 0 && height > 0) {
      const newWidth = Math.min(
        Math.round(width * POPUP_SCALE),
        window.screen.availWidth,
      );
      const newHeight = Math.min(
        Math.round(height * POPUP_SCALE),
        window.screen.availHeight,
      );
      parsed.set("width", String(newWidth));
      parsed.set("height", String(newHeight));
      parsed.set(
        "left",
        String(Math.max(0, (window.outerWidth - newWidth) / 2 + window.screenX)),
      );
      parsed.set(
        "top",
        String(Math.max(0, (window.outerHeight - newHeight) / 2 + window.screenY)),
      );
      features = [...parsed]
        .map(([key, value]) => (value === undefined ? key : `${key}=${value}`))
        .join(",");
    }
    return originalOpen(url, target, features);
  }) as typeof window.open;

  try {
    return await fn();
  } finally {
    window.open = originalOpen;
  }
}

/**
 * 포트원 본인인증 창을 열고, 완료되면 identityVerificationId를 반환한다.
 * 모바일 등 redirect 방식에서는 반환 전에 페이지가 이탈되고
 * redirectUrl(/signup)의 쿼리 파라미터로 결과가 전달된다.
 */
export async function requestIdentityVerification(): Promise<string> {
  const PortOne = await import("@portone/browser-sdk/v2");

  const response = await withEnlargedPopup(() =>
    PortOne.requestIdentityVerification({
      storeId: STORE_ID!,
      channelKey: CHANNEL_KEY!,
      identityVerificationId: `identity-verification-${crypto.randomUUID()}`,
      redirectUrl: `${window.location.origin}/signup`,
      // 미지정 시 브라우저 기본 위치(왼쪽 위)에 뜬다. 크기는 withEnlargedPopup이 확대·재중앙 정렬.
      popup: { center: true },
      bypass: {
        // 이니시스 통합인증. 카카오 인증서(CI 미제공) 제외는 이니시스 계약·콘솔의
        // 노출 인증사 설정으로 처리하고, 백엔드도 CI 없는 건은 거부한다(U005).
        inicisUnified: { flgFixedUser: "N" },
      },
    }),
  );

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
    // code를 보존해 호출부가 U009(이미 가입된 계정) 등으로 분기할 수 있게 한다
    const body = (await res
      .json()
      .catch(() => undefined)) as { code?: string; message?: string } | undefined;
    throw new ApiError(body?.message ?? "본인인증 확인에 실패했습니다.", body?.code);
  }
  return res.json();
}
