import Link from "next/link";
import { FOOTER_GROUPS } from "./nav-items";

/**
 * 모든 페이지 공통 푸터 (서버 컴포넌트).
 * 상단: 링크 그룹(카테고리/두레/고객지원/약관) — 하단: 사업자 정보 + 카피라이트.
 * body가 flex-col, main이 flex-1이므로 별도 mt-auto 없이 화면 바닥에 붙는다.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-[var(--background)] dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* 링크 그룹 */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                {group.title}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* 사업자 정보 + 카피라이트 */}
        <div className="mt-10 border-t border-stone-200 pt-6 dark:border-zinc-800">
          <p className="text-lg font-bold tracking-tight">두레 (Dure)</p>
          <p className="mt-2 text-xs leading-relaxed text-stone-400">
            통합 서비스 마켓플레이스
            <br />
            {/* 사업자 정보는 추후 실제 값으로 교체 */}
            상호명 (주)두레 · 대표 OOO · 사업자등록번호 000-00-00000
            <br />
            주소 서울특별시 · 고객센터 0000-0000
          </p>
          <p className="mt-4 text-xs text-stone-400">
            © {year} Dure. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
