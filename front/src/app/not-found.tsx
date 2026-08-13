import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * 모든 미매칭 경로에 대한 커스텀 404. (서버 컴포넌트)
 * 최상위 not-found는 root layout에서만 렌더되는데, 헤더/푸터가 (main) 그룹
 * 레이아웃으로 내려가 있어 여기서 직접 감싼다.
 * 현 단계는 초기 세팅이라 대부분의 헤더/푸터 링크가 미구현 → "준비 중" 뉘앙스로 안내한다.
 * 스타일: styles/pages/not-found.css
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="not-found-page">
        <p className="not-found-page__code">404</p>
        <h1 className="not-found-page__title">페이지를 찾을 수 없어요</h1>
        <p className="not-found-page__desc">
          요청하신 페이지가 없거나 아직 준비 중입니다. 올미는 현재 초기 세팅
          단계로, 일부 메뉴는 곧 열릴 예정이에요.
        </p>
        <Link href="/" className="not-found-page__home">
          홈으로 돌아가기
        </Link>
      </main>
      <Footer />
    </>
  );
}
