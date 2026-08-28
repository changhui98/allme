import type { Metadata } from "next";
import Link from "next/link";
import ServiceRequestForm from "@/components/mypage/ServiceRequestForm";

export const metadata: Metadata = { title: "요청 등록" };

/** 서비스 요청 등록 — 마이페이지 셸 안. 로그인 가드는 셸이 담당한다. */
export default function MypageRequestNewPage() {
  return (
    <div className="mypage-column">
      <Link href="/mypage/requests" className="support-back support-back--above">
        ← 요청한 서비스
      </Link>
      <h1 className="mypage-page__title">요청 등록</h1>
      <p className="mypage-page__subtitle">
        원하는 작업을 알려주시면 업체들이 제안을 보내드려요.
      </p>
      <ServiceRequestForm />
    </div>
  );
}
