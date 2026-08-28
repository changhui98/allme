import type { Metadata } from "next";
import Link from "next/link";
import MyServiceRequestList from "@/components/mypage/MyServiceRequestList";

export const metadata: Metadata = { title: "요청한 서비스" };

/** 사용자 관점 — 내가 맡긴 서비스 요청 목록. 요청 등록은 그룹 헤더 버튼(내 문의의 1:1 문의하기와 같은 슬롯). */
export default function MypageRequestsPage() {
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">요청한 서비스</h1>
      <p className="mypage-page__subtitle">
        내가 맡긴 서비스 요청을 관리해요.
      </p>
      <div className="mypage-settings">
        <section aria-labelledby="requests-list-title" className="mypage-group">
          <div className="mypage-group__header">
            <h2 id="requests-list-title" className="mypage-group__title">
              요청 목록
            </h2>
            <Link
              href="/mypage/requests/new"
              className="mypage-group__action mypage-group__action--button"
            >
              요청 등록
            </Link>
          </div>
          <MyServiceRequestList />
        </section>
      </div>
    </div>
  );
}
