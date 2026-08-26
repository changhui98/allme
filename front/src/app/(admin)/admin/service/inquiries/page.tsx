import type { Metadata } from "next";
import { Suspense } from "react";
import InquiryList from "@/components/admin/InquiryList";

export const metadata: Metadata = { title: "문의사항" };

/** 1:1 문의 관리 — 목록·필터는 클라이언트(useSearchParams라 Suspense 필요) */
export default function AdminInquiriesPage() {
  return (
    <>
      <h1 className="mypage-page__title">문의사항</h1>
      <p className="mypage-page__subtitle">
        회원이 보낸 1:1 문의를 확인하고 답변해요.
      </p>
      <Suspense fallback={<p className="admin-loading">불러오는 중…</p>}>
        <InquiryList />
      </Suspense>
    </>
  );
}
