package com.allme.back.faq.presentation.controller;

import com.allme.back.faq.application.service.FaqService;
import com.allme.back.faq.domain.FaqCategory;
import com.allme.back.faq.domain.entity.Faq;
import com.allme.back.faq.presentation.dto.request.FaqSaveRequest;
import com.allme.back.faq.presentation.dto.response.AdminFaqDetailResponse;
import com.allme.back.faq.presentation.dto.response.AdminFaqSummaryResponse;
import com.allme.back.faq.presentation.dto.response.FaqIdResponse;
import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.user.domain.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** FAQ 관리 — 매니저/관리자 전용(/api/admin/**). 인가는 클래스 레벨 @RequireRole. */
@RestController
@RequestMapping("/api/admin/faqs")
@RequireRole({Role.MANAGER, Role.ADMIN})
@RequiredArgsConstructor
public class AdminFaqController {

    private final FaqService faqService;

    /** 목록 — category 미지정 시 전체(비공개 포함), 분류 → 노출 순서 순. */
    @GetMapping
    public PageResponse<AdminFaqSummaryResponse> list(
        @RequestParam(required = false) FaqCategory category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return PageResponse.from(
            faqService.getAdminPage(category, page, size).map(AdminFaqSummaryResponse::from));
    }

    @GetMapping("/{id}")
    public AdminFaqDetailResponse detail(@PathVariable Long id) {
        return AdminFaqDetailResponse.from(faqService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FaqIdResponse create(@Valid @RequestBody FaqSaveRequest request) {
        Faq faq = faqService.create(
            request.category(), request.question(), request.answer(),
            request.displayOrder(), request.published());
        return new FaqIdResponse(faq.getId());
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @Valid @RequestBody FaqSaveRequest request) {
        faqService.update(
            id, request.category(), request.question(), request.answer(),
            request.displayOrder(), request.published());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        faqService.delete(id);
    }

}
