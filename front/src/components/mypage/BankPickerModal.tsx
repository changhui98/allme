"use client";

import Modal from "@/components/common/Modal";
import { BANKS, bankIconSrc, type BankCode } from "@/lib/banks";

/**
 * 은행 선택 모달 — 원형 CI 아이콘 그리드에서 클릭 즉시 선택·닫힘.
 * 닫힘 후처리는 공용 Modal의 onClose 하나로 수렴하므로,
 * onSelect에서는 값만 반영하고 닫기는 dialog close 경로에 맡긴다.
 * 스타일: styles/pages/mypage.css (mypage-account__bank-*)
 */
export default function BankPickerModal({
  open,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  /** 현재 선택된 은행 code — 미선택이면 빈 문자열 */
  value: string;
  onSelect: (code: BankCode) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title="은행 선택" onClose={onClose}>
      <ul className="mypage-account__bank-grid">
        {BANKS.map((b) => (
          <li key={b.code}>
            <button
              type="button"
              className={`mypage-account__bank-item${
                value === b.code ? " is-selected" : ""
              }`}
              aria-pressed={value === b.code}
              onClick={() => {
                onSelect(b.code);
                onClose();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 브랜드 SVG, 최적화 불필요 */}
              <img
                src={bankIconSrc(b.code)}
                alt=""
                className="mypage-account__bank-icon"
                width={48}
                height={48}
              />
              <span className="mypage-account__bank-name">{b.shortName}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
