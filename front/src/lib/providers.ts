/**
 * 공개 업체 프로필 클라이언트 — 제안을 받은 클라이언트 등 누구나 조회(/api/providers/{userId}).
 * 사업자번호·연락처·실명은 서버가 내리지 않는다.
 */

import { request } from "@/lib/api";

export type PublicProviderProfile = {
  userId: number;
  /** 최신 승인 신청서의 업체명 — 수동 역할 부여 회원은 null */
  businessName: string | null;
  introduction: string | null;
  nickname: string;
  /** 프로필 이미지 서빙 경로(/images/...) — API_BASE_URL을 붙여 사용 */
  profileImageUrl: string | null;
  /** 업체 승인 일시 — 신청서가 없으면 null */
  providerSince: string | null;
  /** 계약 진행 수 — 수락된 제안 수(결제·완료 도메인 전까지의 대용 지표) */
  contractCount: number;
};

export function fetchPublicProviderProfile(userId: number): Promise<PublicProviderProfile> {
  return request(`/api/providers/${userId}`, {
    fallbackMessage: "업체 정보를 불러오지 못했습니다.",
  });
}
