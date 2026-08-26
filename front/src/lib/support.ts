/**
 * 공지사항·FAQ·1:1 문의 클라이언트(공개/회원 API) — 공통 요청은 lib/api의 request()를 사용한다.
 * 관리자용(/api/admin/**)은 lib/admin.ts에 있고, 라벨 상수는 양쪽이 공유하도록 여기에 둔다.
 */

import { request } from "@/lib/api";
import type { PageResponse } from "@/lib/admin";

/* ---------- 공지사항 ---------- */

export type NoticeSummary = {
  id: number;
  title: string;
  pinned: boolean;
  viewCount: number;
  createdDate: string;
};

export type NoticeDetail = {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  viewCount: number;
  createdDate: string;
  lastModifiedDate: string;
};

/** 목록 정렬 — 백엔드 NoticeSort와 동일. 어느 쪽이든 상단 고정이 먼저. */
export type NoticeSort = "LATEST" | "VIEWS";

export const NOTICE_SORTS: NoticeSort[] = ["LATEST", "VIEWS"];

export const NOTICE_SORT_LABEL: Record<NoticeSort, string> = {
  LATEST: "최신순",
  VIEWS: "조회순",
};

export function fetchNotices(params: {
  /** 제목·본문 부분 일치 검색어 */
  q?: string;
  /** 기본 LATEST — 생략 시 파라미터를 보내지 않는다 */
  sort?: NoticeSort;
  page?: number;
  size?: number;
}): Promise<PageResponse<NoticeSummary>> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.sort && params.sort !== "LATEST") query.set("sort", params.sort);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/notices?${query}`);
}

export function fetchNotice(id: number): Promise<NoticeDetail> {
  return request(`/api/notices/${id}`);
}

/* ---------- FAQ ---------- */

/** 백엔드 FaqCategory enum과 동일 — 선언 순서가 탭·목록 순서 */
export type FaqCategory = "GENERAL" | "ACCOUNT" | "PROVIDER" | "PAYMENT" | "ETC";

export const FAQ_CATEGORIES: FaqCategory[] = [
  "GENERAL",
  "ACCOUNT",
  "PROVIDER",
  "PAYMENT",
  "ETC",
];

export const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  GENERAL: "이용 안내",
  ACCOUNT: "회원·계정",
  PROVIDER: "업체",
  PAYMENT: "결제·정산",
  ETC: "기타",
};

export type Faq = {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
  displayOrder: number;
};

export function fetchFaqs(): Promise<Faq[]> {
  return request("/api/faqs");
}

/* ---------- 1:1 문의 ---------- */

export type InquiryStatus = "PENDING" | "ANSWERED";

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  PENDING: "답변 대기",
  ANSWERED: "답변 완료",
};

export type MyInquirySummary = {
  id: number;
  title: string;
  status: InquiryStatus;
  createdDate: string;
};

export type MyInquiryDetail = {
  id: number;
  title: string;
  content: string;
  status: InquiryStatus;
  answer: string | null;
  answeredDate: string | null;
  createdDate: string;
};

export function submitInquiry(input: {
  title: string;
  content: string;
}): Promise<MyInquiryDetail> {
  return request("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "문의 등록에 실패했습니다.",
  });
}

export function fetchMyInquiries(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<MyInquirySummary>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/inquiries/me?${query}`);
}

export function fetchMyInquiry(id: number): Promise<MyInquiryDetail> {
  return request(`/api/inquiries/me/${id}`);
}
