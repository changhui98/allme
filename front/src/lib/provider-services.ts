/**
 * 업체 서비스("해드려요") 클라이언트 — 업체 API(/api/provider-services)와 공개 API(/open).
 * 사진은 요청 첨부와 같은 2단계: 폼에서 먼저 임시 업로드(uploadServiceListingImage → tempFileId·previewUrl)하고,
 * 제출(create/update)에 참조 목록을 실어 보내면 서버가 정식 파일로 승격한다.
 * 수정은 기존 파일 유지({fileId})와 새 업로드({tempFileId})를 섞은 목록으로 전체 교체한다.
 * 시작가는 서버가 원 단위 정수로 저장한다 — 폼은 만원 단위로 입력받아 manwonToWon으로 변환한다.
 */

import { request } from "@/lib/api";
import type { PageResponse } from "@/lib/admin";
import type { ServiceCategoryCode } from "@/lib/categories";
import { formatPriceFrom } from "@/lib/format";
import { ONLINE_REGION, REGION_LABEL, SEOUL_GU_IDS, type RegionId } from "@/lib/regions";
import type { UnitType } from "@/lib/service-requests";

export type ServiceListingStatus = "PUBLISHED" | "HIDDEN";

export const SERVICE_LISTING_STATUS_LABEL: Record<ServiceListingStatus, string> = {
  PUBLISHED: "공개",
  HIDDEN: "숨김",
};

export const MAX_IMAGES = 5;

export type MyServiceListingSummary = {
  id: number;
  category: ServiceCategoryCode;
  title: string;
  /** 카드에 노출되는 한 줄 소개 */
  summary: string;
  regions: RegionId[];
  /** 시작가(원) — priceNegotiable이면 null */
  priceFrom: number | null;
  priceNegotiable: boolean;
  duration: string | null;
  status: ServiceListingStatus;
  /** 첫 사진 서빙 경로(/images/...) — 없으면 null. API_BASE_URL을 붙여 사용 */
  thumbnailUrl: string | null;
  createdDate: string;
};

export type ServiceListingImage = {
  fileId: number;
  /** 서빙 경로(/images/...) — API_BASE_URL을 붙여 사용 */
  url: string;
};

export type MyServiceListingDetail = Omit<MyServiceListingSummary, "thumbnailUrl"> & {
  description: string;
  unitType: UnitType;
  unitValue: number | null;
  lastModifiedDate: string;
  images: ServiceListingImage[];
};

/* ---------- 공개 게시판("해드려요") — 비로그인 포함 누구나 조회 ---------- */

/** 공개 목록 행 — 상세 설명 없음. 업체명은 최신 승인 신청서(없으면 닉네임), 그마저 없으면 null. */
export type OpenServiceListingSummary = {
  id: number;
  category: ServiceCategoryCode;
  title: string;
  summary: string;
  regions: RegionId[];
  priceFrom: number | null;
  priceNegotiable: boolean;
  duration: string | null;
  providerUserId: number;
  providerName: string | null;
  thumbnailUrl: string | null;
  createdDate: string;
};

export type OpenServiceListingDetail = Omit<OpenServiceListingSummary, "thumbnailUrl"> & {
  description: string;
  unitType: UnitType;
  unitValue: number | null;
  images: ServiceListingImage[];
};

export function fetchOpenServiceListings(params: {
  category?: ServiceCategoryCode;
  q?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<OpenServiceListingSummary>> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.q) query.set("q", params.q);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/provider-services/open?${query}`);
}

export function fetchOpenServiceListing(id: number): Promise<OpenServiceListingDetail> {
  return request(`/api/provider-services/open/${id}`);
}

/** 업체 공개 페이지의 제공 서비스 — 게시 중만, 최신순(상한 50) */
export function fetchOpenServiceListingsByProvider(
  userId: number,
): Promise<OpenServiceListingSummary[]> {
  return request(`/api/provider-services/open/providers/${userId}`);
}

/* ---------- 업체 본인 API — PROVIDER 역할 필요 ---------- */

export type UploadedServiceImage = {
  tempFileId: number;
  previewUrl: string;
};

/** 서비스 사진 임시 업로드. 제출 전까지 서버가 24시간 보관한다. */
export function uploadServiceListingImage(file: File): Promise<UploadedServiceImage> {
  const formData = new FormData();
  formData.append("image", file);

  // Content-Type 미지정 — 브라우저가 multipart boundary를 붙이게 둔다
  return request("/api/provider-services/images", {
    method: "POST",
    body: formData,
    fallbackMessage: "사진 업로드에 실패했습니다.",
  });
}

/** 사진 참조 — 기존 유지(fileId) 또는 새 업로드(tempFileId) 중 하나만 채운다(표시 순서대로). */
export type ServiceListingImageInput = {
  fileId?: number;
  tempFileId?: number;
};

export type ServiceListingSaveInput = {
  category: ServiceCategoryCode;
  title: string;
  summary: string;
  description: string;
  regions: RegionId[];
  /** 원 단위 — priceNegotiable이면 null */
  priceFrom: number | null;
  priceNegotiable: boolean;
  duration: string | null;
  unitValue: number | null;
  images: ServiceListingImageInput[];
};

export function createServiceListing(
  input: ServiceListingSaveInput,
): Promise<MyServiceListingDetail> {
  return request("/api/provider-services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "서비스 등록에 실패했습니다.",
  });
}

export function updateServiceListing(
  id: number,
  input: ServiceListingSaveInput,
): Promise<MyServiceListingDetail> {
  return request(`/api/provider-services/me/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "서비스 수정에 실패했습니다.",
  });
}

export function publishServiceListing(id: number): Promise<MyServiceListingDetail> {
  return request(`/api/provider-services/me/${id}/publish`, {
    method: "POST",
    fallbackMessage: "서비스 공개에 실패했습니다.",
  });
}

export function hideServiceListing(id: number): Promise<MyServiceListingDetail> {
  return request(`/api/provider-services/me/${id}/hide`, {
    method: "POST",
    fallbackMessage: "서비스 숨김에 실패했습니다.",
  });
}

export function deleteServiceListing(id: number): Promise<void> {
  return request(`/api/provider-services/me/${id}`, {
    method: "DELETE",
    fallbackMessage: "서비스 삭제에 실패했습니다.",
  });
}

export function fetchMyServiceListings(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<MyServiceListingSummary>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/provider-services/me?${query}`);
}

export function fetchMyServiceListing(id: number): Promise<MyServiceListingDetail> {
  return request(`/api/provider-services/me/${id}`);
}

/* ---------- 표시 헬퍼 ---------- */

/** 시작가 표시 — "15만원~" / "견적 후 결정" */
export function formatListingPrice(
  priceFrom: number | null,
  priceNegotiable: boolean,
): string {
  return priceNegotiable || priceFrom === null ? "견적 후 결정" : formatPriceFrom(priceFrom);
}

/** 서비스 지역 표시 — "온라인·지역 무관" / "서울 전체" / "서울 강남구·서초구"(3개 이하) / "서울 강남구 외 4곳" */
export function formatRegions(regions: RegionId[]): string {
  if (regions.length === 0) return "";
  if (regions.includes(ONLINE_REGION)) return REGION_LABEL[ONLINE_REGION];
  if (regions.length === SEOUL_GU_IDS.length) return "서울 전체";
  if (regions.length <= 3) {
    return `서울 ${regions.map((id) => REGION_LABEL[id]).join("·")}`;
  }
  return `서울 ${REGION_LABEL[regions[0]]} 외 ${regions.length - 1}곳`;
}
