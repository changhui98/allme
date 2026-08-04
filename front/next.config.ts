import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 프로덕션 이미지에서 .next/standalone만 복사해 슬림하게 실행하기 위함
  output: "standalone",
  // Docker 핫 리로드는 폴링이 아니라 VirtioFS의 파일 이벤트 전달로 동작한다.
  // watchOptions.pollIntervalMs 폴링은 Next 16.2.9 Turbopack에서
  // 파일 감시 자체를 죽이는 문제가 있어 쓰지 않는다 (docker-compose.yml 주석 참조).
};

export default nextConfig;
