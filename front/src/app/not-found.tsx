import Link from "next/link";

/**
 * 모든 미매칭 경로에 대한 커스텀 404. (서버 컴포넌트)
 * App Router 최상위 not-found는 root layout 안에서 렌더되므로 헤더/푸터가 함께 보인다.
 * 현 단계는 초기 세팅이라 대부분의 헤더/푸터 링크가 미구현 → "준비 중" 뉘앙스로 안내한다.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl font-bold tracking-tight text-primary">404</p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        페이지를 찾을 수 없어요
      </h1>
      <p className="max-w-md text-base text-stone-500 dark:text-zinc-400">
        요청하신 페이지가 없거나 아직 준비 중입니다. 올미는 현재 초기 세팅
        단계로, 일부 메뉴는 곧 열릴 예정이에요.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
