import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationList from "@/components/admin/ApplicationList";

export const metadata: Metadata = { title: "업체 신청" };

/** 업체 등록 신청 심사 — 목록·필터는 클라이언트(useSearchParams라 Suspense 필요) */
export default function AdminApplicationsPage() {
  return (
    <>
      <h1 className="mypage-page__title">업체 신청</h1>
      <p className="mypage-page__subtitle">
        업체 등록 신청을 검토하고 승인해요.
      </p>
      <Suspense fallback={<p className="admin-loading">불러오는 중…</p>}>
        <ApplicationList />
      </Suspense>
    </>
  );
}
