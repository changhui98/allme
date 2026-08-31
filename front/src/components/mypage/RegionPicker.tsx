"use client";

import Checkbox from "@/components/common/Checkbox";
import { REGION_LABEL, SEOUL_GU_IDS, type RegionId } from "@/lib/regions";

/**
 * 서비스 지역 복수 선택 — 서울 25개 자치구 체크 그리드 + "서울 전체" 일괄 선택.
 * 온라인(비현장형)은 폼이 픽커 자체를 숨기고 ONLINE으로 고정하므로 여기서는 자치구만 다룬다.
 * 선택 순서와 무관하게 REGIONS 정의 순서로 정렬해 돌려준다(표시·API 계약 일관성).
 * 스타일: styles/pages/mypage.css(region-picker)
 */
export default function RegionPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: RegionId[];
  onChange: (regions: RegionId[]) => void;
  disabled?: boolean;
}) {
  const allSelected = value.length === SEOUL_GU_IDS.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : [...SEOUL_GU_IDS]);
  };

  const toggle = (id: RegionId) => {
    const next = new Set(value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(SEOUL_GU_IDS.filter((gu) => next.has(gu)));
  };

  return (
    <div className="region-picker">
      <div className="region-picker__head">
        <Checkbox checked={allSelected} onChange={toggleAll} disabled={disabled}>
          서울 전체
        </Checkbox>
        <span className="region-picker__count">{value.length}개 선택</span>
      </div>
      <ul className="region-picker__grid">
        {SEOUL_GU_IDS.map((id) => (
          <li key={id}>
            <Checkbox
              checked={value.includes(id)}
              onChange={() => toggle(id)}
              disabled={disabled}
            >
              {REGION_LABEL[id]}
            </Checkbox>
          </li>
        ))}
      </ul>
    </div>
  );
}
