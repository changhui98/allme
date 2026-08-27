import type { Metadata } from "next";
import { Suspense } from "react";
import ProviderList from "@/components/admin/ProviderList";

export const metadata: Metadata = { title: "활동 업체" };

/** 활동 중인 업체(PROVIDER 역할 보유 회원) 목록 — 페이지는 클라이언트(useSearchParams라 Suspense 필요) */
export default function AdminActiveProvidersPage() {
  return (
    <>
      <h1 className="mypage-page__title">활동 업체</h1>
      <p className="mypage-page__subtitle">
        현재 활동 중인 업체를 확인하고, 필요하면 업체 자격을 해제해요.
      </p>
      <Suspense fallback={<p className="admin-loading">불러오는 중…</p>}>
        <ProviderList />
      </Suspense>
    </>
  );
}
