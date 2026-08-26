package com.allme.back.faq.domain.repository;

import com.allme.back.faq.domain.FaqCategory;
import com.allme.back.faq.domain.entity.Faq;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** 소프트 삭제된 행은 모든 조회에서 제외한다. */
public interface FaqRepository {

    Faq save(Faq faq);

    Optional<Faq> findById(Long id);

    /** 관리자 목록 — category가 null이면 전체. 정렬은 pageable이 정한다. */
    Page<Faq> findAdminPage(FaqCategory categoryOrNull, Pageable pageable);

    /** 공개 전체 — 분류 순 → 노출 순서 → id. FAQ는 소량이라 페이징하지 않는다. */
    List<Faq> findAllPublished();

}
