import type { Metadata } from "next";

export const metadata: Metadata = { title: "업체 정보" };

/** 업체 등록 정보 관리 — 업체 등록 기능(백엔드) 구현 전 placeholder */
export default function BizProfilePage() {
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">업체 정보</h1>
      <p className="mypage-page__subtitle">업체 등록 정보를 관리해요.</p>
      <div className="mypage-settings">
        <section aria-labelledby="biz-info-title" className="mypage-group">
          <div className="mypage-group__header">
            <h2 id="biz-info-title" className="mypage-group__title">
              등록 정보
            </h2>
          </div>
          <p className="mypage-group__note">
            아직 등록된 업체 정보가 없어요. 업체 등록 기능이 열리면 여기에서
            관리할 수 있어요.
          </p>
        </section>
      </div>
    </div>
  );
}
