import type { Metadata } from "next";

export const metadata: Metadata = { title: "회원" };

/** 회원 목록 조회 — 다음 커밋에서 연동(UserList) */
export default function AdminUsersPage() {
  return (
    <>
      <h1 className="mypage-page__title">회원</h1>
      <p className="mypage-page__subtitle">가입 회원을 조회해요.</p>
    </>
  );
}
