"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes 래퍼.
 * - attribute="class": <html>에 .dark 클래스를 토글 (수제 CSS의 `.dark .블록` 셀렉터·토큰 재정의와 연동)
 * - defaultTheme="light" + enableSystem: 기본은 라이트, "시스템"은 ThemeMenu에서 명시적으로 고를 때만
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
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
