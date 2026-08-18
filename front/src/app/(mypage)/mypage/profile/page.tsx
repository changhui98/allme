import type { Metadata } from "next";
import ProfileSection from "@/components/mypage/ProfileSection";

export const metadata: Metadata = { title: "내 정보" };

/** 내 정보 — 프로필 사진 변경·계정 정보·로그아웃. 본문은 ProfileSection(클라이언트). */
export default function MypageProfilePage() {
  return (
    <>
      <h1 className="mypage-page__title">내 정보</h1>
      <p className="mypage-page__subtitle">프로필과 계정 정보를 관리해요.</p>
      <ProfileSection />
    </>
  );
}
