package com.allme.back.inquiry.domain.repository;

import com.allme.back.inquiry.domain.InquiryStatus;
import com.allme.back.inquiry.domain.entity.Inquiry;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InquiryRepository {

    Inquiry save(Inquiry inquiry);

    Optional<Inquiry> findById(Long id);

    /** 작성자 본인 확인을 겸한 조회 — 타인 문의는 empty */
    Optional<Inquiry> findByIdAndUserId(Long id, Long userId);

    /** 관리자 목록 — status가 null이면 전체. 정렬은 pageable이 정한다. */
    Page<Inquiry> findPage(InquiryStatus statusOrNull, Pageable pageable);

    Page<Inquiry> findPageByUserId(Long userId, Pageable pageable);

    long countByStatus(InquiryStatus status);

}
