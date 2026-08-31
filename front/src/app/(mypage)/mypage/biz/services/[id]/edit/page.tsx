import type { Metadata } from "next";
import Link from "next/link";
import ProviderServiceForm from "@/components/mypage/ProviderServiceForm";

export const metadata: Metadata = { title: "서비스 수정" };

/** 업체 서비스 수정 — 기존 서비스를 프리필한 같은 폼. 소유권 검증은 API(S001)가 담당한다. */
export default async function BizServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mypage-column">
      <Link href="/mypage/biz/services" className="support-back support-back--above">
        ← 내 서비스
      </Link>
      <h1 className="mypage-page__title">서비스 수정</h1>
      <p className="mypage-page__subtitle">
        수정한 내용은 해드려요에 바로 반영돼요.
      </p>
      <ProviderServiceForm mode="edit" id={Number(id)} />
    </div>
  );
}
