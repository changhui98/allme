"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AltArrowRightIcon } from "@/components/icons/SolarIcons";
import { useOutsideClose } from "@/lib/use-outside-close";

export type SelectOption = { value: string; label: string };

/**
 * 공용 셀렉트 — 네이티브 <select> 대신 쓰는 트리거 버튼 + 커스텀 listbox 팝오버.
 * OS 기본 메뉴 대신 서비스 토큰으로 그리고, 화살표는 닫힘 ">" → 열림 "v"로 회전한다(select.css).
 * - 완전 제어 컴포넌트: value가 options에 없으면(초기화 등) placeholder를 보여준다.
 * - 접근성: 트리거 aria-haspopup/expanded/controls, 패널 role=listbox, 옵션 role=option + aria-selected.
 *   label htmlFor={id}는 트리거 버튼을 가리킨다. 키보드: 트리거에서 ↑↓/Enter/Space로 열기,
 *   패널에서 ↑↓(순환)·Home/End 이동, Enter/Space 선택, ESC·바깥 클릭·Tab으로 닫기.
 * 스타일: styles/components/select.css
 */
export default function Select({
  id,
  value,
  onChange,
  options,
  placeholder = "선택하세요",
  disabled = false,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const panelId = `${id ?? generatedId}-listbox`;

  const selected = options.find((o) => o.value === value);
  const selectedIndex = selected ? options.indexOf(selected) : -1;

  useOutsideClose(open, () => setOpen(false), [rootRef]);

  const optionButtons = () =>
    Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>("button[role='option']") ?? [],
    );

  // 열리면 선택 항목(없으면 첫 항목)에 포커스를 옮기고 보이게 스크롤
  useEffect(() => {
    if (!open) return;
    const buttons = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>("button[role='option']") ?? [],
    );
    const target = buttons[selectedIndex >= 0 ? selectedIndex : 0];
    target?.focus();
    target?.scrollIntoView({ block: "nearest" });
  }, [open, selectedIndex]);

  const choose = (next: string) => {
    if (next !== value) onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handlePanelKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const buttons = optionButtons();
    if (buttons.length === 0) return;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (index: number) => {
      const next = buttons[(index + buttons.length) % buttons.length];
      next.focus();
      next.scrollIntoView({ block: "nearest" });
    };
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusAt(current + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusAt(current - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(buttons.length - 1);
        break;
      case "Tab":
        // 포커스가 밖으로 나가는 순간 닫는다 (기본 이동은 유지)
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={`select${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className="select__trigger"
      >
        <span className={`select__value${selected ? "" : " select__value--placeholder"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <AltArrowRightIcon size={16} className="select__chevron" />
      </button>

      {open && (
        <ul
          ref={panelRef}
          id={panelId}
          role="listbox"
          aria-labelledby={id}
          onKeyDown={handlePanelKeyDown}
          className="select__panel"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option.value)}
                  className={`select__option${isSelected ? " is-selected" : ""}`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
