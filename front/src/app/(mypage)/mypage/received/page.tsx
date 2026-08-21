import { redirect } from "next/navigation";

/** 받은 요청은 업체 모드로 이동됨 — 북마크·히스토리 대비 리다이렉트만 남긴다. */
export default function MypageReceivedPage() {
  redirect("/mypage/biz/received");
}
