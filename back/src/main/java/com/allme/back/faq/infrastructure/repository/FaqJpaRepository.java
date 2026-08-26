package com.allme.back.faq.infrastructure.repository;

import com.allme.back.faq.domain.FaqCategory;
import com.allme.back.faq.domain.entity.Faq;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqJpaRepository extends JpaRepository<Faq, Long> {

    Optional<Faq> findByIdAndDeletedDateIsNull(Long id);

    Page<Faq> findByDeletedDateIsNull(Pageable pageable);

    Page<Faq> findByCategoryAndDeletedDateIsNull(FaqCategory category, Pageable pageable);

    List<Faq> findByPublishedTrueAndDeletedDateIsNullOrderByCategoryAscDisplayOrderAscIdAsc();

}
