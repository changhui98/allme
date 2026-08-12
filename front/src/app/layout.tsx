import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "올미 - 통합 서비스 마켓플레이스",
  description:
    "웹 제작·페인트·청소·인테리어 등 모든 분야의 서비스 업체를 한곳에서 찾고, 예약부터 결제까지 한 번에.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {/* 헤더/푸터는 (main) 그룹 레이아웃 소관 — 인증 페이지((auth))는 독립 레이아웃을 쓴다 */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
