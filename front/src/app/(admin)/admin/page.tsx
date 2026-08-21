import type { Metadata } from "next";

export const metadata: Metadata = { title: "대시보드" };

/** 관리자 대시보드 — 요약 숫자는 다음 커밋에서 연동(AdminDashboardContent) */
export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="mypage-page__title">관리자 대시보드</h1>
      <p className="mypage-page__subtitle">운영 현황을 한눈에 확인해요.</p>
    </>
  );
}
