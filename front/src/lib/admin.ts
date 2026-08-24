/**
 * 관리자 콘솔 API 클라이언트 (/api/admin/**) — 공통 요청은 lib/api의 request()를 사용한다.
 * 전부 세션 쿠키 필수(credentials 기본 포함), 실패 시 ApiError(message, code).
 */

import { request } from "@/lib/api";

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ProviderApplicationSummary = {
  id: number;
  businessName: string;
  applicantLoginId: string;
  status: ApplicationStatus;
  createdDate: string;
};

export type ProviderApplicationDetail = {
  id: number;
  businessName: string;
  businessRegistrationNumber: string;
  introduction: string;
  contactPhone: string;
  applicantLoginId: string;
  status: ApplicationStatus;
  rejectReason: string | null;
  processedByLoginId: string | null;
  createdDate: string;
  processedDate: string | null;
};

export type AdminUserSummary = {
  id: number;
  loginId: string;
  roles: string[];
  createdDate: string;
  withdrawn: boolean;
};

export type AdminDashboardSummary = {
  activeUserCount: number;
  providerCount: number;
  pendingApplicationCount: number;
  totalApplicationCount: number;
};

export function fetchDashboardSummary(): Promise<AdminDashboardSummary> {
  return request("/api/admin/dashboard/summary");
}

export function fetchApplications(params: {
  status?: ApplicationStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<ProviderApplicationSummary>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/admin/provider-applications?${query}`);
}

export function fetchApplication(id: number): Promise<ProviderApplicationDetail> {
  return request(`/api/admin/provider-applications/${id}`);
}

export function approveApplication(id: number): Promise<void> {
  return request(`/api/admin/provider-applications/${id}/approve`, {
    method: "POST",
  });
}

export function rejectApplication(id: number, reason: string): Promise<void> {
  return request(`/api/admin/provider-applications/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export function fetchAdminUsers(params: {
  loginId?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminUserSummary>> {
  const query = new URLSearchParams();
  if (params.loginId) query.set("loginId", params.loginId);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/admin/users?${query}`);
}

/** 상태 표시 라벨·클래스 매핑 — 목록/상세 공용 */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
};
