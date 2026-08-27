"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import {
  fetchNotice,
  type NoticeDetail as NoticeDetailData,
  type NoticeLink,
} from "@/lib/support";

/**
 * 공지사항 상세 — 가운데 컬럼(제목·메타 가운데, 본문 왼쪽) + 하단 ‹ 이전 글 | 목록 | 다음 글 › 내비.
 * 이전·다음은 서버가 공개 공지 시간순으로 내려준다(고정·정렬 옵션 무관). 비공개·삭제·부재는 404(N001) 메시지.
 * 스타일: styles/pages/support.css
 */
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
      <div className="notice-detail">
        <p className="board-page__empty">{error}</p>
        <div className="notice-nav notice-nav--only-list">
          <Link href="/notice" className="btn btn--outline notice-nav__list">
            목록
          </Link>
        </div>
      </div>
    );
  }
  if (!notice) return <p className="board-page__empty">불러오는 중…</p>;

  return (
    <article className="notice-detail">
      <header className="notice-detail__header">
        <h1 className="notice-detail__title">{notice.title}</h1>
        <p className="notice-detail__meta">
          {notice.pinned && (
            <span
              className="notice-list__pin"
              role="img"
              aria-label="고정 공지"
            >
              ★
            </span>
          )}
          <time dateTime={notice.createdDate}>
            {formatDate(notice.createdDate)}
          </time>
          <span aria-hidden="true">·</span>
          <span>조회 {notice.viewCount}</span>
        </p>
      </header>

      <div className="notice-detail__body">{notice.content}</div>

      <nav aria-label="이전·다음 공지" className="notice-nav">
        <NeighborLink link={notice.previous} direction="prev" />
        <Link href="/notice" className="btn btn--outline notice-nav__list">
          목록
        </Link>
        <NeighborLink link={notice.next} direction="next" />
      </nav>
    </article>
  );
}

/** 이전/다음 글 칸 — 없으면 회색 안내만(클릭 불가) */
function NeighborLink({
  link,
  direction,
}: {
  link: NoticeLink | null;
  direction: "prev" | "next";
}) {
  const label = direction === "prev" ? "‹ 이전 글" : "다음 글 ›";
  const className = `notice-nav__item notice-nav__item--${direction}`;
  if (!link) {
    return (
      <span className={`${className} notice-nav__item--empty`}>
        <span className="notice-nav__label">
          {direction === "prev" ? "이전 글이 없어요" : "다음 글이 없어요"}
        </span>
      </span>
    );
  }
  return (
    <Link href={`/notice/${link.id}`} className={className}>
      <span className="notice-nav__label">{label}</span>
      <span className="notice-nav__title">{link.title}</span>
    </Link>
  );
}
