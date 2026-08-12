import Link from "next/link";

/**
 * 인증 페이지 좌측 브랜드 패널. (서버 컴포넌트, lg 이상에서만 표시)
 * 이미지 자산이 아직 없어 장식은 CSS 블러 원 + SVG 동심원으로 구성한다
 * (동심원 = "모든 서비스가 한곳으로 모인다"는 메타포).
 * 다크 모드에서도 테라코타 패널을 유지하되 반 톤 낮춰 눈부심을 줄인다.
 * 주의: 패널 위 텍스트는 white 계열 고정 — text-primary-foreground는
 * 다크에서 니어블랙(#211510)으로 뒤집혀 배경에 묻힌다.
 */
export default function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#c2613d] to-[#a84f30] lg:flex lg:w-1/2 dark:from-[#9a4a2c] dark:to-[#7e3a21]">
      {/* 장식: 블러 원 2개 */}
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -left-16 bottom-32 size-64 rounded-full bg-white/10 blur-3xl"
      />
      {/* 장식: 동심원 스트로크 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="absolute -bottom-24 -right-24 size-96 text-white/10"
      >
        {[60, 100, 140, 180].map((r) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <div className="relative z-10 flex flex-col justify-between p-12">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-white"
          aria-label="올미 홈"
        >
          올미
        </Link>

        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold leading-snug text-white xl:text-4xl">
            필요한 모든 서비스,
            <br />
            올미 한곳에서
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-white/80">
            분야 제한 없는 서비스 마켓플레이스.
            <br />
            탐색부터 예약·결제·정산까지 끊김 없이 이어져요.
          </p>
          <p className="text-sm text-white/60">
            본인인증 기반 안전 거래 · 에스크로 정산 · 검증된 후기
          </p>
        </div>
      </div>
    </aside>
  );
}
