import type { Metadata } from "next";
import Link from "next/link";
import ProviderServiceForm from "@/components/mypage/ProviderServiceForm";

export const metadata: Metadata = { title: "서비스 등록" };

/** 업체 서비스 등록 — 업체 모드 셸 안. PROVIDER 가드는 biz/layout이 담당한다. */
export default function BizServiceNewPage() {
  return (
    <div className="mypage-column">
      <Link href="/mypage/biz/services" className="support-back support-back--above">
        ← 내 서비스
      </Link>
      <h1 className="mypage-page__title">서비스 등록</h1>
      <p className="mypage-page__subtitle">
        제공하는 서비스를 올려두면 해드려요에서 클라이언트가 찾아와요.
      </p>
      <ProviderServiceForm mode="create" />
    </div>
  );
}
