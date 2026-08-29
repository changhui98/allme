"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Checkbox from "@/components/common/Checkbox";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import {
  createFaq,
  deleteFaq,
  fetchAdminFaq,
  updateFaq,
  type AdminFaqDetail,
} from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABEL,
  type FaqCategory,
} from "@/lib/support";

/** FAQ 등록·수정 폼 — NoticeForm과 같은 흐름(등록 후 수정 화면으로, 삭제 후 목록으로). */
export default function FaqForm({ id }: { id?: number }) {
  const router = useRouter();
  const [category, setCategory] = useState<FaqCategory>("GENERAL");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [published, setPublished] = useState(true);
  const [detail, setDetail] = useState<AdminFaqDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    fetchAdminFaq(id)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setCategory(data.category);
        setQuestion(data.question);
        setAnswer(data.answer);
        setDisplayOrder(String(data.displayOrder));
        setPublished(data.published);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const order = Number(displayOrder);
    if (!question.trim() || !answer.trim()) {
      setMessage({ ok: false, text: "질문과 답변을 입력해주세요." });
      return;
    }
    if (!Number.isInteger(order) || order < 0) {
      setMessage({ ok: false, text: "노출 순서는 0 이상의 정수여야 해요." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const input = {
      category,
      question: question.trim(),
      answer: answer.trim(),
      displayOrder: order,
      published,
    };
    try {
      if (id === undefined) {
        const created = await createFaq(input);
        router.replace(`/admin/service/faqs/${created.id}`);
        return;
      }
      await updateFaq(id, input);
      setDetail((prev) => (prev ? { ...prev, ...input } : prev));
      setMessage({ ok: true, text: "저장했어요." });
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (id === undefined || submitting) return;
    setSubmitting(true);
    try {
      await deleteFaq(id);
      router.replace("/admin/service/faqs");
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
      setSubmitting(false);
      setDeleteOpen(false);
    }
  };

  if (loadError) return <p className="admin-error">{loadError}</p>;
  if (id !== undefined && !detail) return <p className="admin-loading">불러오는 중…</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className="admin-form" noValidate>
        <div className="admin-form__row">
          <div className="admin-form__field">
            <label htmlFor="faq-category" className="admin-form__label">
              분류
            </label>
            <Select
              id="faq-category"
              value={category}
              onChange={(v) => setCategory(v as FaqCategory)}
              options={FAQ_CATEGORIES.map((c) => ({ value: c, label: FAQ_CATEGORY_LABEL[c] }))}
              disabled={submitting}
            />
          </div>
          <div className="admin-form__field">
            <label htmlFor="faq-order" className="admin-form__label">
              노출 순서
            </label>
            <input
              id="faq-order"
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              disabled={submitting}
              className="admin-form__input admin-form__input--short"
            />
            <span className="admin-form__hint">같은 분류 안에서 숫자가 작을수록 위에 보여요.</span>
          </div>
        </div>

        <div className="admin-form__field">
          <label htmlFor="faq-question" className="admin-form__label">
            질문
          </label>
          <input
            id="faq-question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
            placeholder="예: 결제는 언제 업체에 전달되나요?"
            disabled={submitting}
            className="admin-form__input"
          />
        </div>

        <div className="admin-form__field">
          <label htmlFor="faq-answer" className="admin-form__label">
            답변
          </label>
          <textarea
            id="faq-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={10000}
            placeholder="답변 내용 — 줄바꿈이 그대로 표시돼요."
            disabled={submitting}
            className="admin-form__textarea admin-form__textarea--tall"
          />
        </div>

        <div className="admin-form__checks">
          <Checkbox checked={published} onChange={setPublished} disabled={submitting}>
            공개 (클라이언트 FAQ에 노출)
          </Checkbox>
        </div>

        {detail && (
          <p className="admin-form__hint">
            등록 {formatDateTime(detail.createdDate)} · 수정{" "}
            {formatDateTime(detail.lastModifiedDate)}
          </p>
        )}

        {message && (
          <p className={message.ok ? "admin-form__hint" : "admin-form__error"} role="status">
            {message.text}
          </p>
        )}

        <div className={`admin-form__actions${id !== undefined ? " admin-form__actions--split" : ""}`}>
          <div className="admin-form__group">
            <button
              type="submit"
              className="btn btn--primary admin-actions__btn"
              disabled={submitting}
            >
              {id === undefined ? "등록" : "저장"}
            </button>
            <Link href="/admin/service/faqs" className="btn btn--outline admin-actions__btn">
              목록으로
            </Link>
          </div>
          {id !== undefined && (
            <button
              type="button"
              className="btn btn--danger admin-actions__btn"
              disabled={submitting}
              onClick={() => setDeleteOpen(true)}
            >
              삭제
            </button>
          )}
        </div>
      </form>

      <Modal
        open={deleteOpen}
        title="FAQ 삭제"
        onClose={() => setDeleteOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="btn btn--outline admin-modal__btn"
              disabled={submitting}
              onClick={() => setDeleteOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn--danger admin-modal__btn"
              disabled={submitting}
              onClick={handleDelete}
            >
              삭제하기
            </button>
          </>
        }
      >
        <p>이 FAQ를 삭제할까요? 삭제하면 클라이언트에서 더 이상 보이지 않아요.</p>
      </Modal>
    </>
  );
}
