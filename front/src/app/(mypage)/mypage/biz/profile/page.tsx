import type { Metadata } from "next";

export const metadata: Metadata = { title: "업체 정보" };

/** 업체 등록 정보 관리 — 업체 등록 기능(백엔드) 구현 전 placeholder */
export default function BizProfilePage() {
  return (
    <>
      <h1 className="mypage-page__title">업체 정보</h1>
      <p className="mypage-page__subtitle">업체 등록 정보를 관리해요.</p>
      <section aria-label="업체 정보" className="mypage-section">
        <p className="mypage-section__empty">
          아직 등록된 업체 정보가 없어요. 업체 등록 기능이 열리면 여기에서
          관리할 수 있어요.
        </p>
      </section>
    </>
  );
}
