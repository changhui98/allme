package com.allme.back.notice.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 공지 등록·수정 공용 요청 */
public record NoticeSaveRequest(

    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    String title,

    @NotBlank(message = "내용을 입력해주세요.")
    @Size(max = 20000, message = "내용은 20,000자 이하로 입력해주세요.")
    String content,

    boolean published,

    boolean pinned

) { }
