package com.allme.back.request.presentation.dto.response;

import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.request.application.service.ServiceRequestService;

/** 참고 사진 임시 업로드 결과 — 제출 시 tempFileId를 보내고, previewUrl로 즉시 미리보기한다. */
public record ServiceRequestAttachmentUploadResponse(
    Long tempFileId,
    String previewUrl
) {

    public static ServiceRequestAttachmentUploadResponse from(UploadTempFile temp) {
        return new ServiceRequestAttachmentUploadResponse(
            temp.getId(), ServiceRequestService.toImageUrl(temp.getStoredPath()));
    }

}
