import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 프로덕션 이미지에서 .next/standalone만 복사해 슬림하게 실행하기 위함
  output: "standalone",
  // Docker bind mount에서는 파일 변경 이벤트가 컨테이너로 전달되지 않아
  // 폴링으로 감시해야 핫 리로드가 동작한다 (compose에서 NEXT_WATCH_POLLING=true 주입)
  ...(process.env.NEXT_WATCH_POLLING === "true"
    ? { watchOptions: { pollIntervalMs: 500 } }
    : {}),
};

export default nextConfig;
