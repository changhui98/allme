package com.allme.back.notice.infrastructure.repository;

import com.allme.back.notice.domain.entity.Notice;
import com.allme.back.notice.domain.repository.NoticeRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class NoticeRepositoryImpl implements NoticeRepository {

    private final NoticeJpaRepository jpaRepository;

    @Override
    public Notice save(Notice notice) {
        return jpaRepository.save(notice);
    }

    @Override
    public Optional<Notice> findById(Long id) {
        return jpaRepository.findByIdAndDeletedDateIsNull(id);
    }

    @Override
    public Optional<Notice> findPublishedById(Long id) {
        return jpaRepository.findByIdAndPublishedTrueAndDeletedDateIsNull(id);
    }

    /** 키워드·published 유무 4가지 조합을 각각 다른 쿼리로 — LIKE에 null 바인딩 금지(JpaRepository 주석 참고) */
    @Override
    public Page<Notice> findAdminPage(Boolean publishedOrNull, String keywordOrNull, Pageable pageable) {
        if (keywordOrNull == null) {
            return publishedOrNull != null
                ? jpaRepository.findByPublishedAndDeletedDateIsNull(publishedOrNull, pageable)
                : jpaRepository.findByDeletedDateIsNull(pageable);
        }
        return publishedOrNull != null
            ? jpaRepository.searchAdminByPublished(publishedOrNull, keywordOrNull, pageable)
            : jpaRepository.searchAdmin(keywordOrNull, pageable);
    }

    @Override
    public Page<Notice> findPublishedPage(String keywordOrNull, Pageable pageable) {
        return keywordOrNull == null
            ? jpaRepository.findByPublishedAndDeletedDateIsNull(true, pageable)
            : jpaRepository.searchPublished(keywordOrNull, pageable);
    }

    @Override
    public Optional<Notice> findPreviousPublished(Long id) {
        return jpaRepository.findFirstByPublishedTrueAndDeletedDateIsNullAndIdLessThanOrderByIdDesc(id);
    }

    @Override
    public Optional<Notice> findNextPublished(Long id) {
        return jpaRepository.findFirstByPublishedTrueAndDeletedDateIsNullAndIdGreaterThanOrderByIdAsc(id);
    }

    @Override
    public void incrementViewCount(Long id) {
        jpaRepository.incrementViewCount(id);
    }

}
