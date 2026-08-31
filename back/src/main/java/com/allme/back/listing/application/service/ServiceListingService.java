package com.allme.back.listing.application.service;

import com.allme.back.file.application.service.FileService;
import com.allme.back.file.domain.FileErrorCode;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.global.exception.AppException;
import com.allme.back.listing.application.service.ServiceListingCommand.ImageRef;
import com.allme.back.listing.domain.ServiceListingErrorCode;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.listing.domain.entity.ServiceListingImage;
import com.allme.back.listing.domain.repository.ServiceListingImageRepository;
import com.allme.back.listing.domain.repository.ServiceListingRepository;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserDisplayQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 업체 서비스 유스케이스 — 사진 업로드·등록·수정·공개/숨김·삭제·조회.
 * 사진은 요청 첨부와 같은 2단계: 폼에서 임시 파일로 올리고(uploadImage), 제출 시 같은 트랜잭션에서
 * 정식 파일로 승격(create/update)한다. 제출하지 않은 임시 파일은 청소 스케줄러가 유예(24h) 후 정리한다.
 * 수정은 기존 파일 유지(fileId)와 새 업로드(tempFileId)를 섞은 목록으로 전체 교체하며, 빠진 기존 파일은
 * 디스크에서도 지운다. user·file 도메인에는 리포지토리 인터페이스·FileService로만 의존한다.
 */
@Service
@RequiredArgsConstructor
public class ServiceListingService {

    public static final int MAX_IMAGES = 5;

    /** 목록 페이지 크기 상한 — 과대 요청 방지 */
    private static final int MAX_PAGE_SIZE = 50;

    /** 검색어 상한 길이 — 과대 입력 방지 */
    private static final int MAX_KEYWORD_LENGTH = 100;

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final ServiceListingRepository listingRepository;
    private final ServiceListingImageRepository imageRepository;
    private final UserRepository userRepository;
    private final UserDisplayQueryRepository userDisplayQueryRepository;
    private final FileService fileService;

    /** 사진 표시용 — 파일 id와 서빙 URL 경로(/images/...) */
    public record Image(Long fileId, String url) { }

    /**
     * 서비스 사진 임시 업로드 — 확장자·내용 검사(S005) 후 임시 레코드(별도 트랜잭션 커밋) + 디스크 저장.
     * 승격은 create/update에서. 반환된 임시 파일의 storedPath로 즉시 미리보기(/images/**)가 가능하다.
     */
    public UploadTempFile uploadImage(Long userId, byte[] content, String extension, String originalFilename) {
        requireActiveUser(userId);
        if (content == null || content.length == 0
            || extension == null || !IMAGE_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new AppException(ServiceListingErrorCode.IMAGE_INVALID);
        }
        UploadTempFile temp = fileService.createTemp(
            FilePurpose.PROVIDER_SERVICE, originalFilename, content.length, extension.toLowerCase(), userId);
        fileService.storeContent(temp, content);
        return temp;
    }

    /**
     * 서비스 등록 — 탈퇴·부재 회원은 U011, 정합성 규칙은 엔티티(S002·S003), 사진 초과는 S004.
     * 등록에서 기존 파일 참조(fileId)는 허용되지 않으며(S005), 임시 파일은 본인·PROVIDER_SERVICE 용도만
     * 승격된다(만료·타인·미존재 F001은 S005로 변환).
     */
    @Transactional
    public ServiceListing create(Long userId, ServiceListingCommand command) {
        requireActiveUser(userId);
        List<ImageRef> refs = dedupedRefs(command.images());

        ServiceListing listing = listingRepository.save(ServiceListing.create(
            userId, command.category(), command.title(), command.summary(), command.description(),
            regionsOf(command), command.priceFrom(), command.priceNegotiable(),
            command.duration(), command.unitValue()
        ));

        saveImages(listing.getId(), userId, refs, Set.of());
        return listing;
    }

    /**
     * 서비스 수정 — 본인 소유만(S001). 사진은 유지(fileId)·신규(tempFileId) 혼합 목록으로 전체 교체하고,
     * 목록에서 빠진 기존 파일은 메타데이터·디스크 파일까지 지운다.
     */
    @Transactional
    public ServiceListing update(Long userId, Long listingId, ServiceListingCommand command) {
        ServiceListing listing = getMine(userId, listingId);
        List<ImageRef> refs = dedupedRefs(command.images());

        listing.update(
            command.category(), command.title(), command.summary(), command.description(),
            regionsOf(command), command.priceFrom(), command.priceNegotiable(),
            command.duration(), command.unitValue()
        );

        List<ServiceListingImage> currentImages = imageRepository.findAllByListingIdOrderBySortOrder(listingId);
        Set<Long> currentFileIds = new LinkedHashSet<>();
        for (ServiceListingImage image : currentImages) {
            currentFileIds.add(image.getFileId());
        }

        imageRepository.deleteAllByListingId(listingId);
        Set<Long> keptFileIds = saveImages(listingId, userId, refs, currentFileIds);

        for (Long fileId : currentFileIds) {
            if (!keptFileIds.contains(fileId)) {
                fileService.remove(fileId);
            }
        }
        return listing;
    }

    /** 공개 전환 — 본인 소유만(S001). 이미 공개면 no-op. */
    @Transactional
    public ServiceListing publish(Long userId, Long listingId) {
        ServiceListing listing = getMine(userId, listingId);
        listing.publish();
        return listing;
    }

    /** 숨김 전환 — 본인 소유만(S001). 공개 목록·상세에서 빠지고 내 서비스에는 남는다. */
    @Transactional
    public ServiceListing hide(Long userId, Long listingId) {
        ServiceListing listing = getMine(userId, listingId);
        listing.hide();
        return listing;
    }

    /** 삭제 — 소프트 삭제. 사진 파일은 남긴다(복구 여지 — 물리 정리는 후속 정책). */
    @Transactional
    public void delete(Long userId, Long listingId) {
        ServiceListing listing = getMine(userId, listingId);
        listing.delete();
    }

    /** 내 서비스 1건 — 타인 서비스는 존재를 노출하지 않고 S001. */
    public ServiceListing getMine(Long userId, Long listingId) {
        return listingRepository.findByIdAndProviderUserId(listingId, userId)
            .orElseThrow(() -> new AppException(ServiceListingErrorCode.LISTING_NOT_FOUND));
    }

    /** 내 서비스 목록 — 숨김 포함, 최신순. */
    public Page<ServiceListing> getMyPage(Long userId, int page, int size) {
        return listingRepository.findPageByProviderUserId(userId, pageable(page, size));
    }

    /** 공개 목록 — 게시 중만, 카테고리 null이면 전체, 키워드는 제목·한 줄 소개 부분 일치(공백이면 무시), 최신순. */
    public Page<ServiceListing> getPublishedPage(ServiceCategory categoryOrNull, String keyword, int page, int size) {
        return listingRepository.findPublishedPage(categoryOrNull, normalizeKeyword(keyword), pageable(page, size));
    }

    /** 공개 상세 — 숨김·삭제·부재는 S001. */
    public ServiceListing getPublished(Long listingId) {
        return listingRepository.findPublishedById(listingId)
            .orElseThrow(() -> new AppException(ServiceListingErrorCode.LISTING_NOT_FOUND));
    }

    /** 업체 공개 페이지의 제공 서비스 — 게시 중만, 최신순, 상한 50(페이징 없이 전부). */
    public List<ServiceListing> getPublishedByProvider(Long providerUserId) {
        return listingRepository
            .findPublishedPageByProviderUserId(providerUserId, pageable(0, MAX_PAGE_SIZE))
            .getContent();
    }

    /** 표시용 닉네임 배치 조회 — 컨트롤러의 응답 조립용(행당 쿼리 금지). */
    public Map<Long, String> nicknamesOf(Collection<Long> userIds) {
        return userDisplayQueryRepository.findNicknamesByUserIds(userIds);
    }

    /** 서비스의 사진 목록(표시 순서) — 파일 경로는 한 번의 배치 조회로 채운다. 깨진 파일 참조는 건너뛴다. */
    public List<Image> imagesOf(Long listingId) {
        List<ServiceListingImage> images = imageRepository.findAllByListingIdOrderBySortOrder(listingId);
        if (images.isEmpty()) {
            return List.of();
        }
        Map<Long, String> paths = fileService.getStoredPaths(
            images.stream().map(ServiceListingImage::getFileId).toList());
        return images.stream()
            .filter(image -> paths.containsKey(image.getFileId()))
            .map(image -> new Image(image.getFileId(), toImageUrl(paths.get(image.getFileId()))))
            .toList();
    }

    /** 목록 썸네일(첫 장) 배치 조회 — 서비스 id → 서빙 URL. 사진 없는 서비스는 맵에서 빠진다. */
    public Map<Long, String> thumbnailsOf(Collection<Long> listingIds) {
        List<ServiceListingImage> images = imageRepository.findAllByListingIdInOrderBySortOrder(listingIds);
        if (images.isEmpty()) {
            return Map.of();
        }
        Map<Long, Long> firstFileIds = new HashMap<>();
        for (ServiceListingImage image : images) {
            firstFileIds.putIfAbsent(image.getListingId(), image.getFileId());
        }
        Map<Long, String> paths = fileService.getStoredPaths(firstFileIds.values());
        Map<Long, String> thumbnails = new HashMap<>();
        firstFileIds.forEach((listingId, fileId) -> {
            String path = paths.get(fileId);
            if (path != null) {
                thumbnails.put(listingId, toImageUrl(path));
            }
        });
        return thumbnails;
    }

    /** 저장 상대경로 → 서빙 URL 경로 (WebConfig의 /images/** 리소스 핸들러와 계약) */
    public static String toImageUrl(String storedPath) {
        return "/images/" + storedPath;
    }

    /**
     * 사진 참조 정리 — fileId·tempFileId 중 정확히 하나만 있어야 하고(S005), 중복은 한 번만, 5장 초과는 S004.
     */
    private static List<ImageRef> dedupedRefs(List<ImageRef> images) {
        if (images == null) {
            return List.of();
        }
        List<ImageRef> refs = new ArrayList<>();
        Set<Long> seenFileIds = new HashSet<>();
        Set<Long> seenTempIds = new HashSet<>();
        for (ImageRef ref : images) {
            if (ref == null || (ref.fileId() == null) == (ref.tempFileId() == null)) {
                throw new AppException(ServiceListingErrorCode.IMAGE_INVALID);
            }
            boolean added = ref.fileId() != null
                ? seenFileIds.add(ref.fileId())
                : seenTempIds.add(ref.tempFileId());
            if (added) {
                refs.add(ref);
            }
        }
        if (refs.size() > MAX_IMAGES) {
            throw new AppException(ServiceListingErrorCode.IMAGE_LIMIT);
        }
        return refs;
    }

    /**
     * 사진 행 저장 — 유지(fileId)는 현재 소유 목록에 있어야 하고(S005), 신규(tempFileId)는 승격한다.
     * 유지한 정식 파일 id 집합을 돌려준다(삭제 대상 계산용).
     */
    private Set<Long> saveImages(Long listingId, Long userId, List<ImageRef> refs, Set<Long> ownedFileIds) {
        List<ServiceListingImage> rows = new ArrayList<>();
        Set<Long> keptFileIds = new HashSet<>();
        for (int i = 0; i < refs.size(); i++) {
            ImageRef ref = refs.get(i);
            Long fileId;
            if (ref.fileId() != null) {
                if (!ownedFileIds.contains(ref.fileId())) {
                    throw new AppException(ServiceListingErrorCode.IMAGE_INVALID);
                }
                fileId = ref.fileId();
                keptFileIds.add(fileId);
            } else {
                fileId = promoteImage(ref.tempFileId(), userId);
            }
            rows.add(ServiceListingImage.create(listingId, fileId, i));
        }
        if (!rows.isEmpty()) {
            imageRepository.saveAll(rows);
        }
        return keptFileIds;
    }

    private Long promoteImage(Long tempFileId, Long userId) {
        try {
            return fileService.promote(tempFileId, userId, FilePurpose.PROVIDER_SERVICE);
        } catch (AppException e) {
            if (e.getErrorCode() == FileErrorCode.TEMP_FILE_NOT_FOUND) {
                throw new AppException(ServiceListingErrorCode.IMAGE_INVALID);
            }
            throw e;
        }
    }

    private static Set<com.allme.back.request.domain.Region> regionsOf(ServiceListingCommand command) {
        return command.regions() == null || command.regions().isEmpty()
            ? Set.of()
            : EnumSet.copyOf(command.regions());
    }

    /** 검색어 정규화 — 앞뒤 공백 제거, 비면 null(검색 없음), 상한 길이로 자른다. */
    static String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }
        String trimmed = keyword.strip();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.length() > MAX_KEYWORD_LENGTH ? trimmed.substring(0, MAX_KEYWORD_LENGTH) : trimmed;
    }

    private void requireActiveUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(UserErrorCode.UNAUTHORIZED));
        if (user.isDeleted()) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
    }

    private static PageRequest pageable(int page, int size) {
        return PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "id")
        );
    }

}
