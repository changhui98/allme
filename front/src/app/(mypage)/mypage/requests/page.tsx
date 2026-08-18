import type { Metadata } from "next";
import MypageEmpty from "@/components/mypage/MypageEmpty";

export const metadata: Metadata = { title: "요청한 서비스" };

/** 사용자 관점 — 내가 맡긴 서비스 요청 목록. (게시판 API 연동 전 빈 상태) */
export default function MypageRequestsPage() {
  return (
    <>
      <h1 className="mypage-page__title">요청한 서비스</h1>
      <p className="mypage-page__subtitle">
        내가 맡긴 서비스 요청을 관리해요.
      </p>
      <MypageEmpty
        message="아직 요청한 서비스가 없어요."
        ctaLabel="해주세요 둘러보기"
        ctaHref="/requests"
      />
    </>
  );
}
