import type { Metadata } from "next";

export const metadata: Metadata = { title: "업체 신청" };

/** 업체 등록 신청 심사 목록 — 다음 커밋에서 연동(ApplicationList) */
export default function AdminApplicationsPage() {
  return (
    <>
      <h1 className="mypage-page__title">업체 신청</h1>
      <p className="mypage-page__subtitle">
        업체 등록 신청을 검토하고 승인해요.
      </p>
    </>
  );
}
