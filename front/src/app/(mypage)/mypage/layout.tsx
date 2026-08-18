import type { Metadata } from "next";
import MypageShell from "@/components/mypage/MypageShell";

export const metadata: Metadata = {
  title: {
    template: "%s | 올미 마이페이지",
    default: "마이페이지",
  },
  description: "내 요청과 받은 요청을 한곳에서 관리하세요.",
};

/**
 * 마이페이지 전용 레이아웃 — 공용 Header/Footer 없이 MypageShell(상단 바+사이드바)로 감싼다.
 * 세션 가드·본문 골격은 MypageShell(클라이언트)이 담당한다.
 */
export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MypageShell>{children}</MypageShell>;
}
