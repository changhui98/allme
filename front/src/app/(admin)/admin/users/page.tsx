import type { Metadata } from "next";
import { Suspense } from "react";
import UserList from "@/components/admin/UserList";

export const metadata: Metadata = { title: "회원" };

/** 회원 목록 — 역할 탭·검색은 클라이언트(useSearchParams라 Suspense 필요) */
export default function AdminUsersPage() {
  return (
    <>
      <h1 className="mypage-page__title">회원</h1>
      <p className="mypage-page__subtitle">가입 회원을 역할별로 조회해요.</p>
      <Suspense fallback={<p className="admin-loading">불러오는 중…</p>}>
        <UserList />
      </Suspense>
    </>
  );
}
