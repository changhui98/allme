/**
 * 인증 페이지(로그인·회원가입) 전용 레이아웃. (서버 컴포넌트)
 * 공통 헤더/푸터 없이 화면 전체를 쓰는 몰입형 구성 — 스플릿 스크린은 다음 단계에서 붙인다.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex min-h-dvh flex-1">{children}</div>;
}
