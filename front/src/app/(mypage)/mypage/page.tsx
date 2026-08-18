import type { Metadata } from "next";
import DashboardContent from "@/components/mypage/DashboardContent";

export const metadata: Metadata = { title: "대시보드" };

/**
 * 마이페이지 대시보드 — 거래 현황 요약. 본문은 DashboardContent(클라이언트, 인사말에 이름 사용).
 * 디자인 원칙: 카드/박스로 감싸지 않는다 — 여백·타이포·hairline 구분선 기반 플랫 레이아웃.
 */
export default function MypageDashboardPage() {
  return <DashboardContent />;
}
