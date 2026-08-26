"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/common/Modal";
import {
  createNotice,
  deleteNotice,
  fetchAdminNotice,
  updateNotice,
  type AdminNoticeDetail,
} from "@/lib/admin";
import { formatDateTime } from "@/lib/format";

/**
 * 공지 등록·수정 폼 — id가 있으면 기존 값을 프리필한 수정 화면(삭제 포함), 없으면 등록 화면.
 * 등록 성공 시 수정 화면으로 replace(뒤로가기로 빈 등록 폼 재진입 방지), 삭제 성공 시 목록으로.
 */
export default function NoticeForm({ id }: { id?: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [detail, setDetail] = useState<AdminNoticeDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    fetchAdminNotice(id)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setTitle(data.title);
        setContent(data.content);
        setPublished(data.published);
        setPinned(data.pinned);
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
    if (!title.trim() || !content.trim()) {
      setMessage({ ok: false, text: "제목과 내용을 입력해주세요." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const input = { title: title.trim(), content: content.trim(), published, pinned };
    try {
      if (id === undefined) {
        const created = await createNotice(input);
        router.replace(`/admin/notices/${created.id}`);
        return;
      }
      await updateNotice(id, input);
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
      await deleteNotice(id);
      router.replace("/admin/notices");
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
        <div className="admin-form__field">
          <label htmlFor="notice-title" className="admin-form__label">
            제목
          </label>
          <input
            id="notice-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="공지 제목 (200자 이내)"
            disabled={submitting}
            className="admin-form__input"
          />
        </div>

        <div className="admin-form__field">
          <label htmlFor="notice-content" className="admin-form__label">
            내용
          </label>
          <textarea
            id="notice-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={20000}
            placeholder="공지 내용 — 줄바꿈이 그대로 표시돼요."
            disabled={submitting}
            className="admin-form__textarea admin-form__textarea--tall"
          />
        </div>

        <div className="admin-form__checks">
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              disabled={submitting}
            />
            공개 (클라이언트 공지사항에 노출)
          </label>
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              disabled={submitting}
            />
            상단 고정
          </label>
        </div>

        {detail && (
          <p className="admin-form__hint">
            작성 {detail.authorLoginId} · 등록 {formatDateTime(detail.createdDate)} · 수정{" "}
            {formatDateTime(detail.lastModifiedDate)}
            {detail.published && (
              <>
                {" · "}
                <Link href={`/notice/${detail.id}`} target="_blank" rel="noreferrer">
                  클라이언트에서 보기 ↗
                </Link>
              </>
            )}
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
            <Link href="/admin/notices" className="btn btn--outline admin-actions__btn">
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
        title="공지 삭제"
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
        <p>이 공지를 삭제할까요? 삭제하면 클라이언트에서 더 이상 보이지 않아요.</p>
      </Modal>
    </>
  );
}
