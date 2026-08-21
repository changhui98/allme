import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import RoleGuard from "@/components/mypage/RoleGuard";

export const metadata: Metadata = {
  title: {
    template: "%s | 올미 관리자",
    default: "관리자",
  },
  description: "올미 운영 관리 콘솔",
};

/**
 * 관리자 전용 레이아웃 — 공용 Header/Footer 없이 AdminShell로 감싼다.
 * MANAGER/ADMIN이 아니면 RoleGuard가 홈으로 돌려보낸다(실질 보호는 백엔드 /api/admin/** 인가).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      <RoleGuard role={["MANAGER", "ADMIN"]} redirectTo="/">
        {children}
      </RoleGuard>
    </AdminShell>
  );
}
