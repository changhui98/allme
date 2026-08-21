import type { Metadata } from "next";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";

export const metadata: Metadata = { title: "대시보드" };

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="mypage-page__title">관리자 대시보드</h1>
      <p className="mypage-page__subtitle">운영 현황을 한눈에 확인해요.</p>
      <AdminDashboardContent />
    </>
  );
}
