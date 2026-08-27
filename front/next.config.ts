import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 프로덕션 이미지에서 .next/standalone만 복사해 슬림하게 실행하기 위함
  output: "standalone",
  // Docker 핫 리로드는 폴링이 아니라 VirtioFS의 파일 이벤트 전달로 동작한다.
  // watchOptions.pollIntervalMs 폴링은 Next 16.2.9 Turbopack에서
  // 파일 감시 자체를 죽이는 문제가 있어 쓰지 않는다 (docker-compose.yml 주석 참조).
  // 그룹 루트·구 경로 리다이렉트 — 서버 컴포넌트 안의 redirect()는 Next 16 dev의 React 성능 트랙이
  // "cannot have a negative time stamp" 오류를 내므로 라우팅 단계(여기)에서 처리한다.
  async redirects() {
    return [
      { source: "/support", destination: "/support/faq", permanent: false },
      { source: "/admin/service", destination: "/admin/service/faqs", permanent: false },
      { source: "/admin/providers", destination: "/admin/providers/applications", permanent: false },
      // 구 경로(업체 관리 그룹으로 이동하기 전) — 북마크·대시보드 링크 호환
      { source: "/admin/applications", destination: "/admin/providers/applications", permanent: false },
      { source: "/admin/applications/:id", destination: "/admin/providers/applications/:id", permanent: false },
      { source: "/mypage/received", destination: "/mypage/biz/received", permanent: false },
    ];
  },
};

export default nextConfig;
