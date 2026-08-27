import type { Metadata } from "next";
import Link from "next/link";
import MyInquiryList from "@/components/mypage/MyInquiryList";

export const metadata: Metadata = { title: "내 문의" };

/** 내 문의 — 보낸 1:1 문의와 답변 상태. 마이페이지 공통 문법(mypage-column > mypage-group). */
export default function MypageInquiriesPage() {
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">내 문의</h1>
      <p className="mypage-page__subtitle">보낸 1:1 문의와 답변을 확인해요.</p>
      <div className="mypage-settings">
        <section aria-labelledby="inquiries-list-title" className="mypage-group">
          <div className="mypage-group__header">
            <h2 id="inquiries-list-title" className="mypage-group__title">
              문의 목록
            </h2>
            <Link
              href="/support/inquiry"
              className="mypage-group__action mypage-group__action--button"
            >
              1:1 문의하기
            </Link>
          </div>
          <MyInquiryList />
        </section>
      </div>
    </div>
  );
}
