import type { Metadata } from "next";
import WithdrawSection from "@/components/mypage/WithdrawSection";

export const metadata: Metadata = { title: "회원탈퇴" };

/** 회원탈퇴 — 리텐션 안내 + 유의사항 동의 후에만 탈퇴 가능한 전용 페이지. */
export default function MypageWithdrawPage() {
  return <WithdrawSection />;
}
