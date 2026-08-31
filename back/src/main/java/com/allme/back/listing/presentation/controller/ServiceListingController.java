package com.allme.back.listing.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.global.exception.AppException;
import com.allme.back.listing.application.service.ServiceListingService;
import com.allme.back.listing.domain.ServiceListingErrorCode;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.listing.presentation.dto.request.ServiceListingSaveRequest;
import com.allme.back.listing.presentation.dto.response.MyServiceListingDetailResponse;
import com.allme.back.listing.presentation.dto.response.MyServiceListingSummaryResponse;
import com.allme.back.listing.presentation.dto.response.ServiceListingImageUploadResponse;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
import org.springframework.web.multipart.MultipartFile;

/**
 * 업체 서비스("해드려요") — 업체 본인 관점 API. 클래스 레벨 @RequireRole(PROVIDER): 활동 업체만.
 * 공개 API(/open)와 경로가 겹치지 않도록 본인 소유 리소스는 /me 프리픽스를 쓴다.
 */
@RestController
@RequestMapping("/api/provider-services")
@RequireRole(Role.PROVIDER)
@RequiredArgsConstructor
public class ServiceListingController {

    private final ServiceListingService listingService;

    /**
     * 서비스 사진 임시 업로드 — multipart "image" 파트, 5MB·jpg/jpeg/png/webp.
     * 제출 전 미리보기용 previewUrl과, 제출 본문에 넣을 tempFileId를 돌려준다.
     */
    @PostMapping("/images")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceListingImageUploadResponse uploadImage(
        @RequestParam("image") MultipartFile image, HttpServletRequest httpRequest
    ) {
        Long userId = SessionUsers.requireUserId(httpRequest);

        byte[] content;
        try {
            content = image.getBytes();
        } catch (IOException e) {
            throw new AppException(ServiceListingErrorCode.IMAGE_INVALID);
        }
        String originalFilename = image.getOriginalFilename();
        return ServiceListingImageUploadResponse.from(
            listingService.uploadImage(userId, content, extensionOf(originalFilename), originalFilename));
    }

    /** 서비스 등록 — 규칙 위반은 S002~S005(400). 등록 즉시 공개(PUBLISHED). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MyServiceListingDetailResponse create(
        @Valid @RequestBody ServiceListingSaveRequest request, HttpServletRequest httpRequest
    ) {
        return detailOf(listingService.create(SessionUsers.requireUserId(httpRequest), request.toCommand()));
    }

    /** 내 서비스 목록 — 숨김 포함, 최신순. 썸네일은 배치 조회로 채운다. */
    @GetMapping("/me")
    public PageResponse<MyServiceListingSummaryResponse> myList(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        HttpServletRequest httpRequest
    ) {
        Page<ServiceListing> listings =
            listingService.getMyPage(SessionUsers.requireUserId(httpRequest), page, size);

        Set<Long> listingIds = new LinkedHashSet<>();
        for (ServiceListing listing : listings.getContent()) {
            listingIds.add(listing.getId());
        }
        Map<Long, String> thumbnails = listingService.thumbnailsOf(listingIds);

        return PageResponse.from(listings.map(listing ->
            MyServiceListingSummaryResponse.from(listing, thumbnails.get(listing.getId()))));
    }

    /** 내 서비스 상세 — 타인 서비스는 404(S001) */
    @GetMapping("/me/{id}")
    public MyServiceListingDetailResponse myDetail(@PathVariable Long id, HttpServletRequest httpRequest) {
        return detailOf(listingService.getMine(SessionUsers.requireUserId(httpRequest), id));
    }

    /** 서비스 수정 — 사진은 유지(fileId)·신규(tempFileId) 혼합 목록으로 전체 교체. */
    @PutMapping("/me/{id}")
    public MyServiceListingDetailResponse update(
        @PathVariable Long id,
        @Valid @RequestBody ServiceListingSaveRequest request,
        HttpServletRequest httpRequest
    ) {
        return detailOf(listingService.update(SessionUsers.requireUserId(httpRequest), id, request.toCommand()));
    }

    /** 공개 전환 — 멱등 */
    @PostMapping("/me/{id}/publish")
    public MyServiceListingDetailResponse publish(@PathVariable Long id, HttpServletRequest httpRequest) {
        return detailOf(listingService.publish(SessionUsers.requireUserId(httpRequest), id));
    }

    /** 숨김 전환 — 멱등. 공개 목록·상세에서 빠지고 내 서비스에는 남는다. */
    @PostMapping("/me/{id}/hide")
    public MyServiceListingDetailResponse hide(@PathVariable Long id, HttpServletRequest httpRequest) {
        return detailOf(listingService.hide(SessionUsers.requireUserId(httpRequest), id));
    }

    /** 삭제 — 소프트 삭제 */
    @DeleteMapping("/me/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        listingService.delete(SessionUsers.requireUserId(httpRequest), id);
    }

    private MyServiceListingDetailResponse detailOf(ServiceListing listing) {
        return MyServiceListingDetailResponse.from(listing, listingService.imagesOf(listing.getId()));
    }

    private static String extensionOf(String filename) {
        if (filename == null) {
            return null;
        }
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : null;
    }

}
