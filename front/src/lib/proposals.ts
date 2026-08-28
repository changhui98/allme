/**
 * 업체 제안("해드릴게요") 클라이언트 — 업체의 제안 등록·보낸 제안, 요청 작성자의 받은 제안·수락·거절.
 * 금액은 서버가 원 단위 정수로 저장한다(폼은 만원 입력 → manwonToWon 변환).
 */

import { request } from "@/lib/api";
import type { PageResponse } from "@/lib/admin";
import type { ServiceCategoryCode } from "@/lib/categories";
import type { ServiceRequestStatus } from "@/lib/service-requests";

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

/** 요청 작성자가 보는 받은 제안 — providerName은 업체명(없으면 닉네임) */
export type ReceivedProposal = {
  id: number;
  providerUserId: number;
  providerName: string | null;
  /** 원 단위 */
  amount: number;
  message: string;
  status: ProposalStatus;
  createdDate: string;
  decidedDate: string | null;
};

/** 업체가 보는 내 제안 — 요청 제목·상태 포함(요청이 삭제됐으면 null) */
export type MyProposal = {
  id: number;
  requestId: number;
  requestTitle: string | null;
  requestCategory: ServiceCategoryCode | null;
  requestStatus: ServiceRequestStatus | null;
  amount: number;
  message: string;
  status: ProposalStatus;
  createdDate: string;
  decidedDate: string | null;
};

export function submitProposal(
  requestId: number,
  input: { amount: number; message: string },
): Promise<MyProposal> {
  return request(`/api/service-requests/${requestId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "제안 등록에 실패했습니다.",
  });
}

/** 이 요청에 내가 낸 제안 — 없으면 null(404 B001을 정상 상태로 취급) */
export async function fetchMyProposalForRequest(requestId: number): Promise<MyProposal | null> {
  try {
    return await request<MyProposal>(`/api/service-requests/${requestId}/proposals/me`);
  } catch (e) {
    if (e instanceof Error && "code" in e && (e as { code?: string }).code === "B001") return null;
    throw e;
  }
}

export function fetchReceivedProposals(requestId: number): Promise<ReceivedProposal[]> {
  return request(`/api/service-requests/${requestId}/proposals`);
}

export function acceptProposal(requestId: number, proposalId: number): Promise<void> {
  return request(`/api/service-requests/${requestId}/proposals/${proposalId}/accept`, {
    method: "POST",
    fallbackMessage: "제안 수락에 실패했습니다.",
  });
}

export function rejectProposal(requestId: number, proposalId: number): Promise<void> {
  return request(`/api/service-requests/${requestId}/proposals/${proposalId}/reject`, {
    method: "POST",
    fallbackMessage: "제안 거절에 실패했습니다.",
  });
}

export function fetchMyProposals(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<MyProposal>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return request(`/api/proposals/me?${query}`);
}
