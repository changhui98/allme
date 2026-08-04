import { getCategoryLabel } from "@/lib/categories";
import type { PortfolioItem } from "@/lib/mock/providers";

/**
 * 업체 상세의 포트폴리오 그리드 (서버 컴포넌트).
 * 이미지 스토리지가 아직 없어 그라데이션 타일로 대체한다 —
 * 스토리지 연동 시 타일 배경을 next/image(fill)로 교체하면 된다.
 */
export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.id}
          className={`relative aspect-[4/3] overflow-hidden rounded-lg ${item.themeClass}`}
        >
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 text-white">
            <p className="text-[11px] font-medium opacity-80">
              {getCategoryLabel(item.category)}
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-snug">
              {item.title}
            </p>
            <p className="mt-0.5 truncate text-xs opacity-80">{item.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
