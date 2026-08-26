package com.allme.back.inquiry.infrastructure.repository;

import com.allme.back.inquiry.domain.InquiryStatus;
import com.allme.back.inquiry.domain.entity.Inquiry;
import com.allme.back.inquiry.domain.repository.InquiryRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class InquiryRepositoryImpl implements InquiryRepository {

    private final InquiryJpaRepository jpaRepository;

    @Override
    public Inquiry save(Inquiry inquiry) {
        return jpaRepository.save(inquiry);
    }

    @Override
    public Optional<Inquiry> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<Inquiry> findByIdAndUserId(Long id, Long userId) {
        return jpaRepository.findByIdAndUserId(id, userId);
    }

    @Override
    public Page<Inquiry> findPage(InquiryStatus statusOrNull, Pageable pageable) {
        return statusOrNull != null
            ? jpaRepository.findByStatus(statusOrNull, pageable)
            : jpaRepository.findAll(pageable);
    }

    @Override
    public Page<Inquiry> findPageByUserId(Long userId, Pageable pageable) {
        return jpaRepository.findByUserId(userId, pageable);
    }

    @Override
    public long countByStatus(InquiryStatus status) {
        return jpaRepository.countByStatus(status);
    }

}
