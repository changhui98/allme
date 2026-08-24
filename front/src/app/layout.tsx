import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import SessionExpiredModal from "@/components/common/SessionExpiredModal";

// 배포 시 NEXT_PUBLIC_SITE_URL을 실제 도메인으로 교체 — OG 이미지 절대 URL의 기준이 된다
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "올미 — 통합 서비스 마켓플레이스",
    template: "%s | 올미",
  },
  description:
    "웹 제작·페인트·청소·인테리어 등 모든 분야의 서비스 업체를 한곳에서 찾고, 예약부터 결제까지 한 번에.",
  // title/description/images를 비워두면 각 페이지의 resolved 값과
  // opengraph-image.png 파일 컨벤션이 자동 적용된다(페이지마다 og:title이 달라짐)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "올미",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // html/body 프레임 스타일(height·flex column)은 styles/base.css가 담당
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/* 컬러 테마(data-accent) 복원 — next-themes는 모드(.dark)만 다루므로,
            액센트는 첫 페인트 전에 이 동기 스크립트로 붙여 FOUC를 막는다 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=localStorage.getItem("accent");if(a)document.documentElement.setAttribute("data-accent",a)}catch(e){}`,
          }}
        />
        {/* 헤더/푸터는 (main) 그룹 레이아웃 소관 — 인증 페이지((auth))는 독립 레이아웃을 쓴다 */}
        <ThemeProvider>
          {children}
          {/* 세션 만료(401 U011) 전역 안내 — 어느 라우트 그룹에서든 뜰 수 있게 루트에 상주 */}
          <SessionExpiredModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
