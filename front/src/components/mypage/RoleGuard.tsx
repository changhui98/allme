"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useMe } from "@/lib/use-me";
import { hasRole, type UserRole } from "@/lib/user";

/**
 * 역할 가드 — 로그인했지만 역할이 없으면 /mypage로 보낸다(직접 URL 진입 대비 UX 가드).
 * 비로그인 리다이렉트는 MypageShell이 담당하고, 실질 보호는 백엔드 @RequireRole 인가가 담당한다.
 */
export default function RoleGuard({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const router = useRouter();
  const { status, me } = useMe();
  const allowed = hasRole(me, role);

  useEffect(() => {
    if (status === "ready" && me && !allowed) {
      router.replace("/mypage");
    }
  }, [status, me, allowed, router]);

  // 세션 확인 중이거나 리다이렉트 대기 — 본문 미노출
  if (!allowed) {
    return null;
  }
  return <>{children}</>;
}
