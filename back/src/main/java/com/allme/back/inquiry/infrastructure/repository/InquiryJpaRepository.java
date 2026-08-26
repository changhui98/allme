package com.allme.back.inquiry.infrastructure.repository;

import com.allme.back.inquiry.domain.InquiryStatus;
import com.allme.back.inquiry.domain.entity.Inquiry;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryJpaRepository extends JpaRepository<Inquiry, Long> {

    Optional<Inquiry> findByIdAndUserId(Long id, Long userId);

    Page<Inquiry> findByStatus(InquiryStatus status, Pageable pageable);

    Page<Inquiry> findByUserId(Long userId, Pageable pageable);

    long countByStatus(InquiryStatus status);

}
