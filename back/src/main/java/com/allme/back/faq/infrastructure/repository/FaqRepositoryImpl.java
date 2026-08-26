package com.allme.back.faq.infrastructure.repository;

import com.allme.back.faq.domain.FaqCategory;
import com.allme.back.faq.domain.entity.Faq;
import com.allme.back.faq.domain.repository.FaqRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FaqRepositoryImpl implements FaqRepository {

    private final FaqJpaRepository jpaRepository;

    @Override
    public Faq save(Faq faq) {
        return jpaRepository.save(faq);
    }

    @Override
    public Optional<Faq> findById(Long id) {
        return jpaRepository.findByIdAndDeletedDateIsNull(id);
    }

    @Override
    public Page<Faq> findAdminPage(FaqCategory categoryOrNull, Pageable pageable) {
        return categoryOrNull != null
            ? jpaRepository.findByCategoryAndDeletedDateIsNull(categoryOrNull, pageable)
            : jpaRepository.findByDeletedDateIsNull(pageable);
    }

    @Override
    public List<Faq> findAllPublished() {
        return jpaRepository.findByPublishedTrueAndDeletedDateIsNullOrderByCategoryAscDisplayOrderAscIdAsc();
    }

}
