package com.allme.back.faq.presentation.controller;

import com.allme.back.faq.application.service.FaqService;
import com.allme.back.faq.presentation.dto.response.FaqResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** FAQ 공개 API — 비로그인 포함 누구나 조회(@RequireRole 없음). 공개 항목만, 페이징 없음. */
@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @GetMapping
    public List<FaqResponse> list() {
        return faqService.getAllPublished().stream().map(FaqResponse::from).toList();
    }

}
