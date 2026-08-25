import type { Metadata } from "next";
import MypageEmpty from "@/components/mypage/MypageEmpty";

export const metadata: Metadata = { title: "받은 요청" };

/** 업체 관점 — 내가 올린 해드려요에 들어온 요청 목록. (게시판 API 연동 전 빈 상태) */
export default function BizReceivedPage() {
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">받은 요청</h1>
      <p className="mypage-page__subtitle">
        내 서비스에 들어온 요청을 확인해요.
      </p>
      <div className="mypage-settings">
        <section aria-labelledby="received-list-title" className="mypage-group">
          <div className="mypage-group__header">
            <h2 id="received-list-title" className="mypage-group__title">
              받은 요청 목록
            </h2>
          </div>
          <MypageEmpty
            message="아직 받은 요청이 없어요. 해드려요에 서비스를 등록하면 요청을 받을 수 있어요."
            ctaLabel="내 서비스 관리로"
            ctaHref="/mypage/biz/services"
          />
        </section>
      </div>
    </div>
  );
}
