"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/common/Modal";
import { currentPath, loginHref } from "@/lib/login-redirect";
import { submitInquiry } from "@/lib/support";
import { useMe } from "@/lib/use-me";

/**
 * 1:1 문의 작성 — 로그인 필수. 비로그인이면 /login?redirect=/support/inquiry로 보낸다(셸 가드와 같은 방식).
 * 등록 성공 시 안내 모달 → 마이페이지 내 문의로 이동. 스타일: styles/pages/support.css
 */
export default function InquiryForm() {
  const router = useRouter();
  const { status, me, retry } = useMe();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status === "ready" && !me) {
      router.replace(loginHref(currentPath()));
    }
  }, [status, me, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!title.trim() || !content.trim()) {
      setSubmitError("제목과 문의 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitInquiry({ title: title.trim(), content: content.trim() });
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "문의 등록에 실패했습니다.");
      setSubmitting(false);
    }
  };

  if (status === "error") {
    return (
      <div className="inquiry-form">
        <p className="inquiry-form__error">서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.</p>
        <div className="inquiry-form__actions">
          <button type="button" onClick={retry} className="btn btn--outline inquiry-form__btn">
            다시 시도
          </button>
        </div>
      </div>
    );
  }
  // 세션 확인 중이거나 로그인 페이지로 이동 대기
  if (!me) return <p className="board-page__empty">불러오는 중…</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className="inquiry-form" noValidate>
        <div className="inquiry-form__field">
          <label htmlFor="inquiry-title" className="inquiry-form__label">
            제목
          </label>
          <input
            id="inquiry-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="무엇이 궁금하신가요?"
            disabled={submitting}
            className="inquiry-form__input"
          />
        </div>
        <div className="inquiry-form__field">
          <label htmlFor="inquiry-content" className="inquiry-form__label">
            문의 내용
          </label>
          <textarea
            id="inquiry-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            placeholder="상황을 자세히 적어주시면 더 정확하게 답변드릴 수 있어요. (5,000자 이내)"
            disabled={submitting}
            className="inquiry-form__textarea"
          />
          <span className="inquiry-form__hint">
            답변은 마이페이지의 내 문의에서 확인할 수 있어요. 개인정보(카드번호·비밀번호 등)는 적지 말아주세요.
          </span>
        </div>

        {submitError && (
          <p className="inquiry-form__error" role="alert">
            {submitError}
          </p>
        )}

        <div className="inquiry-form__actions">
          <button type="submit" className="btn btn--primary inquiry-form__btn" disabled={submitting}>
            문의 보내기
          </button>
        </div>
      </form>

      <Modal
        open={done}
        title="문의를 보냈어요"
        onClose={() => router.push("/mypage/inquiries")}
        closeOnBackdrop={false}
        actions={
          <button
            type="button"
            className="btn btn--primary admin-modal__btn"
            onClick={() => router.push("/mypage/inquiries")}
          >
            내 문의 보기
          </button>
        }
      >
        <p>담당자가 확인 후 답변드릴게요. 답변은 마이페이지 &gt; 내 문의에서 확인할 수 있어요.</p>
      </Modal>
    </>
  );
}
