import type { Metadata } from "next";
import Link from "next/link";
import MyProviderServiceList from "@/components/mypage/MyProviderServiceList";

export const metadata: Metadata = { title: "내 서비스" };

/** 업체 관점 — 해드려요에 올린 내 서비스 관리. 서비스 등록은 그룹 헤더 버튼(요청한 서비스와 같은 슬롯). */
export default function BizServicesPage() {
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">내 서비스</h1>
      <p className="mypage-page__subtitle">
        해드려요에 올린 내 서비스를 관리해요.
      </p>
      <div className="mypage-settings">
        <section aria-labelledby="services-list-title" className="mypage-group">
          <div className="mypage-group__header">
            <h2 id="services-list-title" className="mypage-group__title">
              서비스 목록
            </h2>
            <Link
              href="/mypage/biz/services/new"
              className="mypage-group__action mypage-group__action--button"
            >
              서비스 등록
            </Link>
          </div>
          <MyProviderServiceList />
        </section>
      </div>
    </div>
  );
}
