package com.allme.back.listing.presentation.dto.request;

import com.allme.back.listing.application.service.ServiceListingCommand;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 서비스 등록·수정 본문(POST·PUT 공용) — 형식 검증만 여기서,
 * 필드 간 규칙(가격·지역 조합)은 엔티티가 S002·S003으로 검사한다.
 */
public record ServiceListingSaveRequest(

    @NotNull(message = "카테고리를 선택해주세요.")
    ServiceCategory category,

    @NotBlank(message = "서비스명을 입력해주세요.")
    @Size(max = 100, message = "서비스명은 100자 이하로 입력해주세요.")
    String title,

    @NotBlank(message = "한 줄 소개를 입력해주세요.")
    @Size(max = 150, message = "한 줄 소개는 150자 이하로 입력해주세요.")
    String summary,

    @NotBlank(message = "상세 설명을 입력해주세요.")
    @Size(max = 5000, message = "상세 설명은 5,000자 이하로 입력해주세요.")
    String description,

    @NotEmpty(message = "서비스 지역을 선택해주세요.")
    List<@NotNull Region> regions,

    @Positive(message = "시작가는 1원 이상이어야 합니다.")
    Long priceFrom,

    boolean priceNegotiable,

    @Size(max = 30, message = "작업 소요 기간은 30자 이하로 입력해주세요.")
    String duration,

    @Positive(message = "가격 기준 규모는 1 이상이어야 합니다.")
    Integer unitValue,

    @Size(max = 5, message = "서비스 사진은 최대 5장까지 등록할 수 있습니다.")
    List<@Valid @NotNull ImageRefRequest> images

) {

    /** 사진 참조 — 기존 유지(fileId) 또는 새 업로드(tempFileId) 중 하나만. 조합 규칙은 서비스가 S005로 검사. */
    public record ImageRefRequest(Long fileId, Long tempFileId) { }

    public ServiceListingCommand toCommand() {
        return new ServiceListingCommand(
            category, title, summary, description, regions,
            priceFrom, priceNegotiable, duration, unitValue,
            images == null
                ? null
                : images.stream()
                    .map(image -> new ServiceListingCommand.ImageRef(image.fileId(), image.tempFileId()))
                    .toList()
        );
    }

}
