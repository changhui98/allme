import BrandPanel from "@/components/auth/BrandPanel";

/**
 * 인증 페이지(로그인·회원가입) 전용 레이아웃. (서버 컴포넌트)
 * 공통 헤더/푸터 없는 몰입형 스플릿 스크린 — lg 이상에서 좌측 브랜드 패널,
 * 우측이 폼 영역의 세로/가로 중앙 정렬을 담당한다(모바일은 폼만).
 * 스타일: styles/pages/auth.css
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-layout">
      <BrandPanel />
      <div className="auth-layout__content">{children}</div>
    </div>
  );
}
