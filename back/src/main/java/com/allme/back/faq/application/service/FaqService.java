package com.allme.back.faq.application.service;

import com.allme.back.faq.domain.FaqCategory;
import com.allme.back.faq.domain.FaqErrorCode;
import com.allme.back.faq.domain.entity.Faq;
import com.allme.back.faq.domain.repository.FaqRepository;
import com.allme.back.global.exception.AppException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** FAQ 유스케이스 — 관리자 CRUD와 공개 조회. */
@Service
@RequiredArgsConstructor
public class FaqService {

    /** 목록 페이지 크기 상한 — 과대 요청 방지 */
    private static final int MAX_PAGE_SIZE = 50;

    private final FaqRepository faqRepository;

    @Transactional
    public Faq create(FaqCategory category, String question, String answer, int displayOrder, boolean published) {
        return faqRepository.save(Faq.create(category, question, answer, displayOrder, published));
    }

    @Transactional
    public void update(
        Long id, FaqCategory category, String question, String answer, int displayOrder, boolean published
    ) {
        getById(id).update(category, question, answer, displayOrder, published);
    }

    /** 소프트 삭제 */
    @Transactional
    public void delete(Long id) {
        getById(id).delete();
    }

    /** 관리자 조회 — 비공개 포함, 삭제는 제외(Q001). */
    public Faq getById(Long id) {
        return faqRepository.findById(id)
            .orElseThrow(() -> new AppException(FaqErrorCode.FAQ_NOT_FOUND));
    }

    /** 관리자 목록 — category가 null이면 전체, 분류 → 노출 순서 → id 순. */
    public Page<Faq> getAdminPage(FaqCategory categoryOrNull, int page, int size) {
        PageRequest pageable = PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
            Sort.by("category", "displayOrder", "id")
        );
        return faqRepository.findAdminPage(categoryOrNull, pageable);
    }

    /** 공개 전체 — 클라이언트 FAQ 페이지용. */
    public List<Faq> getAllPublished() {
        return faqRepository.findAllPublished();
    }

}
