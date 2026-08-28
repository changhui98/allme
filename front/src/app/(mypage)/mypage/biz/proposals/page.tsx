import type { Metadata } from "next";
import Link from "next/link";
import MyProposalList from "@/components/mypage/MyProposalList";

export const metadata: Metadata = { title: "보낸 제안" };

/** 업체 관점 — 해주세요 요청에 보낸 제안과 그 상태. 마이페이지 공통 문법(mypage-column > mypage-group). */
export default function BizProposalsPage() {
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">보낸 제안</h1>
      <p className="mypage-page__subtitle">해주세요 요청에 보낸 제안과 수락 여부를 확인해요.</p>
      <div className="mypage-settings">
        <section aria-labelledby="proposals-list-title" className="mypage-group">
          <div className="mypage-group__header">
            <h2 id="proposals-list-title" className="mypage-group__title">
              제안 목록
            </h2>
            <Link href="/requests" className="mypage-group__action mypage-group__action--button">
              해주세요 둘러보기
            </Link>
          </div>
          <MyProposalList />
        </section>
      </div>
    </div>
  );
}
