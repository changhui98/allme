package com.allme.back.request.presentation.dto.request;

import com.allme.back.request.application.service.ServiceRequestSubmitCommand;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** 요청 등록 본문 — 형식 검증만 여기서, 필드 간 규칙(일정·예산·지역 조합)은 엔티티가 R002~R004로 검사한다. */
public record ServiceRequestSubmitRequest(

    @NotNull(message = "카테고리를 선택해주세요.")
    ServiceCategory category,

    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 100, message = "제목은 100자 이하로 입력해주세요.")
    String title,

    @NotBlank(message = "요청 내용을 입력해주세요.")
    @Size(max = 5000, message = "요청 내용은 5,000자 이하로 입력해주세요.")
    String content,

    @NotNull(message = "지역을 선택해주세요.")
    Region region,

    @Size(max = 200, message = "상세 주소는 200자 이하로 입력해주세요.")
    String addressDetail,

    /** ISO yyyy-MM-dd */
    LocalDate preferredDate,

    boolean scheduleNegotiable,

    @PositiveOrZero(message = "예산은 0 이상이어야 합니다.")
    Long budgetMin,

    @PositiveOrZero(message = "예산은 0 이상이어야 합니다.")
    Long budgetMax,

    boolean budgetNegotiable,

    @Positive(message = "작업 규모는 1 이상이어야 합니다.")
    Integer unitValue,

    @Size(max = 5, message = "참고 사진은 최대 5장까지 첨부할 수 있습니다.")
    List<@NotNull Long> attachmentTempFileIds

) {

    public ServiceRequestSubmitCommand toCommand() {
        return new ServiceRequestSubmitCommand(
            category, title, content, region, addressDetail,
            preferredDate, scheduleNegotiable,
            budgetMin, budgetMax, budgetNegotiable,
            unitValue, attachmentTempFileIds
        );
    }

}
