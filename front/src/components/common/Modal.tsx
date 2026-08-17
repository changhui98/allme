"use client";

import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

/**
 * 공통 모달. 네이티브 <dialog>의 showModal()을 사용해
 * top-layer·포커스 트랩·ESC 닫기·::backdrop을 브라우저에 위임한다.
 * 모든 닫힘 경로(ESC·백드롭 클릭·close() 호출·open=false 전환)는
 * dialog의 close 이벤트 하나로 수렴하므로 호출부는 onClose로만 후처리한다.
 * actions의 버튼은 반드시 type="button"으로 — 폼 안에서 쓰여도 제출되지 않게.
 * 스타일: styles/components/modal.css
 */
export default function Modal({
  open,
  title,
  children,
  actions,
  onClose,
  closeOnBackdrop = true,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  /** 버튼 영역 — 공용 .btn 클래스(lib/button-styles)로 구성해서 넘긴다 */
  actions?: ReactNode;
  /** 어떤 경로로든 모달이 닫힐 때 호출 — 호출부는 여기서 open state를 끈다 */
  onClose: () => void;
  /** 패널 밖(백드롭) 클릭으로 닫기 허용 여부 */
  closeOnBackdrop?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // showModal()로 연 dialog는 패널 밖 클릭 시 dialog 자신이 이벤트 타깃이 된다
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && e.target === ref.current) {
      ref.current?.close();
    }
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleClick}
    >
      <h2 id={titleId} className="modal__title">
        {title}
      </h2>
      <div className="modal__body">{children}</div>
      {actions ? <div className="modal__actions">{actions}</div> : null}
    </dialog>
  );
}
