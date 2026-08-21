import type { Metadata } from "next";
import BizDashboardContent from "@/components/mypage/BizDashboardContent";

export const metadata: Metadata = { title: "업체 대시보드" };

export default function BizDashboardPage() {
  return <BizDashboardContent />;
}
