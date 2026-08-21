import RoleGuard from "@/components/mypage/RoleGuard";

/**
 * 업체 모드(/mypage/biz/*) 공통 가드 — PROVIDER가 아니면 /mypage로 되돌린다.
 * 하위 페이지 전체에 적용되므로 각 페이지에서 RoleGuard를 반복하지 않는다.
 * 비로그인 가드는 상위 MypageShell이 담당한다.
 */
export default function BizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="PROVIDER">{children}</RoleGuard>;
}
