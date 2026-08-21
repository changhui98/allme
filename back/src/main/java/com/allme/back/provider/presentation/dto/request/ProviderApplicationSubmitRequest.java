package com.allme.back.provider.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProviderApplicationSubmitRequest(

    @NotBlank(message = "업체명을 입력해주세요.")
    @Size(max = 100, message = "업체명은 100자 이하로 입력해주세요.")
    String businessName,

    /** 하이픈 유무 모두 허용(123-45-67890 / 1234567890) — 저장 시 서비스가 하이픈을 제거한다 */
    @NotBlank(message = "사업자등록번호를 입력해주세요.")
    @Pattern(regexp = "^\\d{3}-?\\d{2}-?\\d{5}$", message = "사업자등록번호 형식이 올바르지 않습니다.")
    String businessRegistrationNumber,

    @NotBlank(message = "업체 소개를 입력해주세요.")
    @Size(max = 1000, message = "업체 소개는 1000자 이하로 입력해주세요.")
    String introduction,

    @NotBlank(message = "연락처를 입력해주세요.")
    @Pattern(regexp = "^[0-9-]{9,20}$", message = "연락처 형식이 올바르지 않습니다.")
    String contactPhone

) { }
