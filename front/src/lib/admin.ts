/**
 * 관리자 콘솔 API 클라이언트 (/api/admin/**) — 공통 요청은 lib/api의 request()를 사용한다.
 * 전부 세션 쿠키 필수(credentials 기본 포함), 실패 시 ApiError(message, code).
 */

import { request } from "@/lib/api";
import type { FaqCategory, InquiryStatus, NoticeSort } from "@/lib/support";
import type { UserRole } from "@/lib/user";

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
  /** 승인/반려한 관리자·매니저 loginId — 대기 중이면 null */
  processedByLoginId: string | null;
  createdDate: string;
  processedDate: string | null;
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
  /** 답변 대기 중인 1:1 문의 수 */
  pendingInquiryCount: number;
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
  /** 역할 필터 — USER는 "일반 회원"(USER 외 역할 없음), 그 외는 보유 여부 */
  role?: UserRole;
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminUserSummary>> {
  const query = new URLSearchParams();
  if (params.loginId) query.set("loginId", params.loginId);
  if (params.role) query.set("role", params.role);
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

/* ---------- 공지사항 관리 ---------- */

export type AdminNoticeSummary = {
  id: number;
  title: string;
  published: boolean;
  pinned: boolean;
  viewCount: number;
  authorLoginId: string;
  createdDate: string;
};

export type AdminNoticeDetail = AdminNoticeSummary & {
  content: string;
  lastModifiedDate: string;
};

export type NoticeSaveInput = {
  title: string;
  content: string;
  published: boolean;
  pinned: boolean;
};

export function fetchAdminNotices(params: {
  published?: boolean;
  /** 제목·본문 부분 일치 검색어 */
  q?: string;
  /** 기본 LATEST(고정 우선 + 최신순) */
  sort?: NoticeSort;
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminNoticeSummary>> {
  const query = new URLSearchParams();
  if (params.published !== undefined) query.set("published", String(params.published));
  if (params.q) query.set("q", params.q);
  if (params.sort && params.sort !== "LATEST") query.set("sort", params.sort);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/admin/notices?${query}`);
}

export function fetchAdminNotice(id: number): Promise<AdminNoticeDetail> {
  return request(`/api/admin/notices/${id}`);
}

export function createNotice(input: NoticeSaveInput): Promise<{ id: number }> {
  return request("/api/admin/notices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "공지 등록에 실패했습니다.",
  });
}

export function updateNotice(id: number, input: NoticeSaveInput): Promise<void> {
  return request(`/api/admin/notices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "공지 수정에 실패했습니다.",
  });
}

export function deleteNotice(id: number): Promise<void> {
  return request(`/api/admin/notices/${id}`, {
    method: "DELETE",
    fallbackMessage: "공지 삭제에 실패했습니다.",
  });
}

/* ---------- FAQ 관리 ---------- */

export type AdminFaqSummary = {
  id: number;
  category: FaqCategory;
  question: string;
  displayOrder: number;
  published: boolean;
  createdDate: string;
};

export type AdminFaqDetail = AdminFaqSummary & {
  answer: string;
  lastModifiedDate: string;
};

export type FaqSaveInput = {
  category: FaqCategory;
  question: string;
  answer: string;
  displayOrder: number;
  published: boolean;
};

export function fetchAdminFaqs(params: {
  category?: FaqCategory;
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminFaqSummary>> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/admin/faqs?${query}`);
}

export function fetchAdminFaq(id: number): Promise<AdminFaqDetail> {
  return request(`/api/admin/faqs/${id}`);
}

export function createFaq(input: FaqSaveInput): Promise<{ id: number }> {
  return request("/api/admin/faqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "FAQ 등록에 실패했습니다.",
  });
}

export function updateFaq(id: number, input: FaqSaveInput): Promise<void> {
  return request(`/api/admin/faqs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "FAQ 수정에 실패했습니다.",
  });
}

export function deleteFaq(id: number): Promise<void> {
  return request(`/api/admin/faqs/${id}`, {
    method: "DELETE",
    fallbackMessage: "FAQ 삭제에 실패했습니다.",
  });
}

/* ---------- 1:1 문의 관리 ---------- */

export type AdminInquirySummary = {
  id: number;
  title: string;
  status: InquiryStatus;
  authorLoginId: string;
  /** 답변한 관리자·매니저 loginId — 답변 전이면 null */
  answeredByLoginId: string | null;
  createdDate: string;
  answeredDate: string | null;
};

export type AdminInquiryDetail = AdminInquirySummary & {
  content: string;
  answer: string | null;
};

export function fetchAdminInquiries(params: {
  status?: InquiryStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminInquirySummary>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/admin/inquiries?${query}`);
}

export function fetchAdminInquiry(id: number): Promise<AdminInquiryDetail> {
  return request(`/api/admin/inquiries/${id}`);
}

export function answerInquiry(id: number, answer: string): Promise<void> {
  return request(`/api/admin/inquiries/${id}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
    fallbackMessage: "답변 등록에 실패했습니다.",
  });
}

/* ---------- 활동 업체 관리 ---------- */

/**
 * 활동 업체 목록 행 — "활동 중"은 PROVIDER 역할 보유 기준. 업체명·사업자번호·승인일·승인자는
 * 최신 승인 신청서에서 오며, 수동으로 역할이 부여된 회원(테스트 계정 등)은 전부 null.
 */
export type ActiveProviderSummary = {
  userId: number;
  loginId: string;
  businessName: string | null;
  businessRegistrationNumber: string | null;
  approvedDate: string | null;
  approvedByLoginId: string | null;
};

export type ActiveProviderDetail = {
  userId: number;
  loginId: string;
  /** 최신 승인 신청서 — 없으면 null */
  application: {
    id: number;
    businessName: string;
    businessRegistrationNumber: string;
    introduction: string;
    contactPhone: string;
    createdDate: string;
    approvedDate: string | null;
    approvedByLoginId: string | null;
  } | null;
};

export function fetchActiveProviders(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<ActiveProviderSummary>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/admin/providers?${query}`);
}

export function fetchActiveProvider(userId: number): Promise<ActiveProviderDetail> {
  return request(`/api/admin/providers/${userId}`);
}

/** 업체 자격 해제 — PROVIDER 역할이 즉시 회수되고 사유는 이력으로 남는다. */
export function revokeProvider(userId: number, reason: string): Promise<void> {
  return request(`/api/admin/providers/${userId}/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
    fallbackMessage: "업체 자격 해제에 실패했습니다.",
  });
}
