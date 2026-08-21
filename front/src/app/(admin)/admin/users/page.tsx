import type { Metadata } from "next";
import UserList from "@/components/admin/UserList";

export const metadata: Metadata = { title: "회원" };

export default function AdminUsersPage() {
  return (
    <>
      <h1 className="mypage-page__title">회원</h1>
      <p className="mypage-page__subtitle">가입 회원을 조회해요.</p>
      <UserList />
    </>
  );
}
