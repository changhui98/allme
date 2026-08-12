import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * 일반 페이지 공통 레이아웃: 헤더 + 본문 + 푸터. (서버 컴포넌트)
 * body가 flex column이므로 별도 래퍼 없이 그대로 이어 붙인다.
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
