/**
 * 서비스 요청("해주세요") 클라이언트 — 회원 API(/api/service-requests). 공통 요청은 lib/api의 request()를 사용한다.
 * 첨부는 2단계: 폼에서 사진을 먼저 임시 업로드(uploadServiceRequestImage → tempFileId·previewUrl)하고,
 * 제출(submitServiceRequest)에 tempFileId 목록을 실어 보내면 서버가 정식 파일로 승격한다.
 * 예산은 서버가 원 단위 정수로 저장한다 — 폼은 만원 단위로 입력받아 여기서 변환한다.
 */

import { request } from "@/lib/api";
import type { PageResponse } from "@/lib/admin";
import type { ServiceCategoryCode } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import type { RegionId } from "@/lib/regions";

export type ServiceRequestStatus = "OPEN" | "CLOSED";

export const SERVICE_REQUEST_STATUS_LABEL: Record<ServiceRequestStatus, string> = {
  OPEN: "모집 중",
  CLOSED: "마감",
};

/** 백엔드 UnitType — 카테고리가 결정한다 */
export type UnitType = "PYEONG" | "PAGE";

export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  PYEONG: "평",
  PAGE: "페이지",
};

export const MAX_ATTACHMENTS = 5;
/** 백엔드 허용 확장자(jpg/jpeg/png/webp)·5MB와 동일 */
export const ATTACHMENT_ACCEPT = "image/jpeg,image/png,image/webp";
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

export type MyServiceRequestSummary = {
  id: number;
  category: ServiceCategoryCode;
  title: string;
  region: RegionId;
  preferredDate: string | null;
  scheduleNegotiable: boolean;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetNegotiable: boolean;
  status: ServiceRequestStatus;
  /** 받은 제안 수 */
  proposalCount: number;
  createdDate: string;
};

export type ServiceRequestAttachment = {
  fileId: number;
  /** 서빙 경로(/images/...) — API_BASE_URL을 붙여 사용 */
  url: string;
};

export type MyServiceRequestDetail = MyServiceRequestSummary & {
  content: string;
  addressDetail: string | null;
  unitType: UnitType;
  unitValue: number | null;
  /** 수락한 제안 id — 마감(CLOSED) 시 기록 */
  acceptedProposalId: number | null;
  attachments: ServiceRequestAttachment[];
};

/* ---------- 공개 게시판("해주세요") — 비로그인 포함 누구나 조회 ---------- */

/** 공개 목록 행 — 상세 주소·본문 없음, 작성자는 닉네임만 */
export type OpenServiceRequestSummary = {
  id: number;
  category: ServiceCategoryCode;
  title: string;
  region: RegionId;
  preferredDate: string | null;
  scheduleNegotiable: boolean;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetNegotiable: boolean;
  status: ServiceRequestStatus;
  /** 탈퇴 회원 등 닉네임이 없으면 null */
  authorNickname: string | null;
  proposalCount: number;
  createdDate: string;
};

export type OpenServiceRequestDetail = OpenServiceRequestSummary & {
  content: string;
  unitType: UnitType;
  unitValue: number | null;
  /** 조회자가 작성자 본인인지(비로그인은 false) */
  mine: boolean;
  attachments: ServiceRequestAttachment[];
};

export function fetchOpenServiceRequests(params: {
  category?: ServiceCategoryCode;
  page?: number;
  size?: number;
}): Promise<PageResponse<OpenServiceRequestSummary>> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/service-requests/open?${query}`);
}

export function fetchOpenServiceRequest(id: number): Promise<OpenServiceRequestDetail> {
  return request(`/api/service-requests/open/${id}`);
}

export type UploadedAttachment = {
  tempFileId: number;
  previewUrl: string;
};

/** 참고 사진 임시 업로드. 제출 전까지 서버가 24시간 보관한다. */
export function uploadServiceRequestImage(file: File): Promise<UploadedAttachment> {
  const formData = new FormData();
  formData.append("image", file);

  // Content-Type 미지정 — 브라우저가 multipart boundary를 붙이게 둔다
  return request("/api/service-requests/attachments", {
    method: "POST",
    body: formData,
    fallbackMessage: "사진 업로드에 실패했습니다.",
  });
}

export type ServiceRequestSubmitInput = {
  category: ServiceCategoryCode;
  title: string;
  content: string;
  region: RegionId;
  addressDetail: string | null;
  /** yyyy-MM-dd */
  preferredDate: string | null;
  scheduleNegotiable: boolean;
  /** 원 단위 */
  budgetMin: number | null;
  budgetMax: number | null;
  budgetNegotiable: boolean;
  unitValue: number | null;
  attachmentTempFileIds: number[];
};

export function submitServiceRequest(
  input: ServiceRequestSubmitInput,
): Promise<MyServiceRequestDetail> {
  return request("/api/service-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "요청 등록에 실패했습니다.",
  });
}

export function fetchMyServiceRequests(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<MyServiceRequestSummary>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/service-requests/me?${query}`);
}

export function fetchMyServiceRequest(id: number): Promise<MyServiceRequestDetail> {
  return request(`/api/service-requests/me/${id}`);
}

/* ---------- 표시 헬퍼 ---------- */

const WON_PER_MANWON = 10_000;

/** 만원 단위 입력값 → 원 */
export function manwonToWon(manwon: number): number {
  return manwon * WON_PER_MANWON;
}

/** 원 → "50만원" (만원 미만 단수는 "3,500원"처럼 원 단위로). 제안 금액 표시에도 쓴다 */
export function formatWon(won: number): string {
  if (won >= WON_PER_MANWON && won % WON_PER_MANWON === 0) {
    return `${(won / WON_PER_MANWON).toLocaleString("ko-KR")}만원`;
  }
  return `${won.toLocaleString("ko-KR")}원`;
}

/** 희망 예산 표시 — "50~80만원" / "50만원" / "제안 받아요" */
export function formatBudget(
  min: number | null,
  max: number | null,
  negotiable: boolean,
): string {
  if (negotiable || min === null || max === null) return "제안 받아요";
  if (min === max) return formatWon(min);
  const sameUnit =
    min >= WON_PER_MANWON && min % WON_PER_MANWON === 0 && max % WON_PER_MANWON === 0;
  return sameUnit
    ? `${(min / WON_PER_MANWON).toLocaleString("ko-KR")}~${(max / WON_PER_MANWON).toLocaleString("ko-KR")}만원`
    : `${formatWon(min)}~${formatWon(max)}`;
}

/** 희망 일정 표시 — "2026.09.01" / "협의 가능" */
export function formatSchedule(date: string | null, negotiable: boolean): string {
  return negotiable || !date ? "협의 가능" : formatDate(date);
}
