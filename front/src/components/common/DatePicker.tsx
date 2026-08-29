"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AltArrowLeftIcon, AltArrowRightIcon, CalendarIcon } from "@/components/icons/SolarIcons";
import { formatDate } from "@/lib/format";
import { useOutsideClose } from "@/lib/use-outside-close";

/**
 * 공용 날짜 선택 — 네이티브 input[type=date] 대신 쓰는 트리거 버튼 + 커스텀 달력 팝오버(Select와 같은 골격).
 * 값 계약은 "yyyy-MM-dd"(빈 값 "")로 네이티브와 같고, min 이전 날짜는 비활성.
 * 키보드: 트리거 Enter/Space/↓ 열기, 그리드 ←→↑↓(±1/±7일, 달 경계 넘기면 달 이동)·Home/End(주 처음/끝)·
 * PageUp/PageDown(월 이동)·Enter/Space 선택, ESC·바깥 클릭·Tab 닫기(useOutsideClose).
 * 날짜 계산은 로컬 타임(new Date(y, m, d))만 쓴다. 스타일: styles/components/datepicker.css
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** 달력 6주(42칸) — 해당 달 1일이 속한 주의 일요일부터 */
function calendarCells(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export default function DatePicker({
  id,
  value,
  onChange,
  min,
  placeholder = "날짜를 선택하세요",
  disabled = false,
  className,
}: {
  id?: string;
  /** "yyyy-MM-dd" 또는 "" */
  value: string;
  onChange: (value: string) => void;
  /** 이 날짜 이전은 선택 불가 ("yyyy-MM-dd") */
  min?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const panelId = `${id ?? generatedId}-calendar`;

  const selected = parseKey(value);
  const minDate = min ? parseKey(min) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toKey(today);

  // 열 때 보이는 달 — 선택값 > (min이 오늘보다 늦으면 min) > 오늘
  const initialMonth = () => {
    if (selected) return addMonths(selected, 0);
    if (minDate && minDate > today) return addMonths(minDate, 0);
    return addMonths(today, 0);
  };
  const [month, setMonth] = useState<Date>(initialMonth);
  // 그리드 키보드 포커스 위치(날짜 키) — 열릴 때 선택값 또는 오늘
  const [focusKey, setFocusKey] = useState<string>(value || todayKey);

  useOutsideClose(open, () => setOpen(false), [rootRef]);

  const isDisabledDate = (d: Date) => minDate !== null && d < minDate;

  const openPanel = () => {
    if (disabled) return;
    const start = initialMonth();
    setMonth(start);
    let key = selected ? value : todayKey;
    if (!selected && minDate && minDate > today) key = toKey(minDate);
    setFocusKey(key);
    setOpen(true);
  };

  // 패널이 열리거나 포커스 키가 바뀌면 해당 셀로 포커스 이동
  useEffect(() => {
    if (!open) return;
    const cell = gridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${focusKey}"]`);
    cell?.focus();
  }, [open, focusKey, month]);

  const choose = (d: Date) => {
    onChange(toKey(d));
    setOpen(false);
    triggerRef.current?.focus();
  };

  const clear = () => {
    onChange("");
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveFocus = (next: Date) => {
    if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) {
      setMonth(addMonths(next, 0));
    }
    setFocusKey(toKey(next));
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPanel();
    }
  };

  const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = parseKey(focusKey) ?? today;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(addDays(current, -1));
        break;
      case "ArrowRight":
        e.preventDefault();
        moveFocus(addDays(current, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(addDays(current, -7));
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(addDays(current, 7));
        break;
      case "Home":
        e.preventDefault();
        moveFocus(addDays(current, -current.getDay()));
        break;
      case "End":
        e.preventDefault();
        moveFocus(addDays(current, 6 - current.getDay()));
        break;
      case "PageUp":
        e.preventDefault();
        moveFocus(new Date(current.getFullYear(), current.getMonth() - 1, current.getDate()));
        break;
      case "PageDown":
        e.preventDefault();
        moveFocus(new Date(current.getFullYear(), current.getMonth() + 1, current.getDate()));
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const cells = calendarCells(month);
  const monthLabel = `${month.getFullYear()}년 ${month.getMonth() + 1}월`;
  const todayDisabled = isDisabledDate(today);

  return (
    <div
      ref={rootRef}
      className={`datepicker${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        className="datepicker__trigger"
      >
        <span className={`datepicker__value${selected ? "" : " datepicker__value--placeholder"}`}>
          {selected ? formatDate(value) : placeholder}
        </span>
        <CalendarIcon size={18} className="datepicker__icon" />
      </button>

      {open && (
        <div id={panelId} role="dialog" aria-label="날짜 선택" className="datepicker__panel">
          <div className="datepicker__head">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="datepicker__nav"
            >
              <AltArrowLeftIcon size={18} />
            </button>
            <span className="datepicker__month" aria-live="polite">
              {monthLabel}
            </span>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="datepicker__nav"
            >
              <AltArrowRightIcon size={18} />
            </button>
          </div>

          <div className="datepicker__weekdays" aria-hidden="true">
            {WEEKDAYS.map((w, i) => (
              <span key={w} className={`datepicker__weekday${i === 0 ? " datepicker__weekday--sun" : ""}`}>
                {w}
              </span>
            ))}
          </div>

          <div ref={gridRef} role="grid" onKeyDown={handleGridKeyDown} className="datepicker__grid">
            {cells.map((d) => {
              const key = toKey(d);
              const outside = d.getMonth() !== month.getMonth();
              const isSelected = key === value;
              const dateDisabled = isDisabledDate(d);
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  data-date={key}
                  tabIndex={key === focusKey ? 0 : -1}
                  aria-selected={isSelected}
                  aria-label={formatDate(key)}
                  disabled={dateDisabled}
                  onClick={() => choose(d)}
                  className={
                    `datepicker__day` +
                    (outside ? " datepicker__day--outside" : "") +
                    (key === todayKey ? " datepicker__day--today" : "") +
                    (d.getDay() === 0 ? " datepicker__day--sun" : "") +
                    (isSelected ? " is-selected" : "")
                  }
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="datepicker__foot">
            <button type="button" onClick={clear} className="datepicker__foot-btn">
              지우기
            </button>
            <button
              type="button"
              onClick={() => choose(today)}
              disabled={todayDisabled}
              className="datepicker__foot-btn datepicker__foot-btn--primary"
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
