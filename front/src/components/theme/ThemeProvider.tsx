"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes 래퍼.
 * - attribute="class": <html>에 .dark 클래스를 토글 (globals.css의 @custom-variant와 연동)
 * - defaultTheme="light" + enableSystem={false}: OS 설정과 무관하게 기본은 항상 라이트
 * - disableTransitionOnChange: 테마 전환 시 색상 트랜지션이 번지는 현상 방지
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
