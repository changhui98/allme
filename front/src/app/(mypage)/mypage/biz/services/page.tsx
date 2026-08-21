import type { Metadata } from "next";
import MypageEmpty from "@/components/mypage/MypageEmpty";

export const metadata: Metadata = { title: "내 서비스" };

/**
 * 업체 관점 — 해드려요에 올린 내 서비스 관리. (게시판 API 연동 전 빈 상태)
 * CTA는 게시판 API 설계 후 글 작성 폼 경로로 교체한다.
 */
export default function BizServicesPage() {
  return (
    <>
      <h1 className="mypage-page__title">내 서비스</h1>
      <p className="mypage-page__subtitle">
        해드려요에 올린 내 서비스를 관리해요.
      </p>
      <MypageEmpty
        message="아직 등록한 서비스가 없어요. 서비스 등록 기능은 준비 중이에요."
        ctaLabel="해드려요 둘러보기"
        ctaHref="/services"
      />
    </>
  );
}
