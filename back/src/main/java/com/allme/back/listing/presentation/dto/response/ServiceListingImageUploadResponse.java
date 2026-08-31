package com.allme.back.listing.presentation.dto.response;

import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.listing.application.service.ServiceListingService;

/** 서비스 사진 임시 업로드 결과 — 제출 시 tempFileId를 보내고, previewUrl로 즉시 미리보기한다. */
public record ServiceListingImageUploadResponse(
    Long tempFileId,
    String previewUrl
) {

    public static ServiceListingImageUploadResponse from(UploadTempFile temp) {
        return new ServiceListingImageUploadResponse(
            temp.getId(), ServiceListingService.toImageUrl(temp.getStoredPath()));
    }

}
