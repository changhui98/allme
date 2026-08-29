import type { ReactNode } from "react";

/**
 * 공용 체크박스 — 폼 옵션(협의 가능·제안 받아요·공개·상단 고정 등)용.
 * 네이티브 input은 시각적으로만 숨겨 클릭·포커스·:checked를 그대로 담당하게 하고,
 * 둥근 사각 커스텀 박스에 체크 아이콘을 그린다(동의 체크 ConsentStep·WithdrawSection의 원형 패턴과 같은 원리).
 * 스타일: styles/components/checkbox.css
 */
export default function Checkbox({
  checked,
  onChange,
  children,
  disabled = false,
  id,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 라벨 텍스트 */
  children: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <label className={`checkbox${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="checkbox__input"
      />
      <span aria-hidden="true" className="checkbox__box">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="checkbox__icon"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span className="checkbox__label">{children}</span>
    </label>
  );
}
