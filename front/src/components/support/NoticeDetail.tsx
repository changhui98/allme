"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { fetchNotice, type NoticeDetail as NoticeDetailData } from "@/lib/support";

/** 공지사항 상세 — 비공개·삭제·부재는 서버가 404(N001)로 응답하므로 메시지만 보여준다. */
export default function NoticeDetail({ id }: { id: number }) {
  const [notice, setNotice] = useState<NoticeDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNotice(id)
      .then((data) => {
        if (!cancelled) setNotice(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <>
        <p className="board-page__empty">{error}</p>
        <Link href="/notice" className="support-back support-back--below">
          ← 공지사항 목록
        </Link>
      </>
    );
  }
  if (!notice) return <p className="board-page__empty">불러오는 중…</p>;

  return (
    <article className="notice-detail">
      <header className="notice-detail__header">
        <h1 className="notice-detail__title">{notice.title}</h1>
        <p className="notice-detail__meta">
          {notice.pinned && <span className="notice-list__pin">고정</span>}
          <time dateTime={notice.createdDate}>{formatDate(notice.createdDate)}</time>
          <span aria-hidden="true">·</span>
          <span>조회 {notice.viewCount}</span>
        </p>
      </header>
      <div className="notice-detail__body">{notice.content}</div>
      <Link href="/notice" className="support-back support-back--below">
        ← 공지사항 목록
      </Link>
    </article>
  );
}
