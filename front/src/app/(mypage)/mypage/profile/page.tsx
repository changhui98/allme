import type { Metadata } from "next";
import ProfileSection from "@/components/mypage/ProfileSection";

export const metadata: Metadata = { title: "내 정보" };

/** 내 정보 — 제목·히어로·그룹을 44rem 컬럼으로 묶어 본문 가운데 배치. 본문은 ProfileSection(클라이언트). */
export default function MypageProfilePage() {
  return (
    <div className="mypage-profile-page">
      <h1 className="mypage-page__title">내 정보</h1>
      <p className="mypage-page__subtitle">프로필과 계정 정보를 관리해요.</p>
      <ProfileSection />
    </div>
  );
}
