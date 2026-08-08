import Link from "next/link";
import { CATEGORIES, type CategoryId } from "@/lib/categories";

/**
 * 목록 페이지 상단의 카테고리 필터 탭 (서버 컴포넌트).
 * 탭은 단순 링크라 클라이언트 상태 없이 URL(?category=...)로 필터를 표현한다 —
 * 서버에서 필터링된 결과가 SSR되어 SEO 방침을 충족한다.
 */
export default function CategoryTabs({
  basePath,
  active,
}: {
  basePath: "/services" | "/requests";
  active?: CategoryId;
}) {
  const tabs = [
    { id: undefined, label: "전체", href: basePath },
    ...CATEGORIES.map((c) => ({
      id: c.id as CategoryId | undefined,
      label: c.label,
      href: `${basePath}?category=${c.id}`,
    })),
  ];

  return (
    <nav aria-label="카테고리 필터" className="overflow-x-auto">
      <ul className="flex items-center gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.label} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                    : "block rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                }
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
