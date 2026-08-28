package com.allme.back.request.application.service;

import com.allme.back.file.application.service.FileService;
import com.allme.back.file.domain.FileErrorCode;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.global.exception.AppException;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.ServiceRequestErrorCode;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.request.domain.entity.ServiceRequestAttachment;
import com.allme.back.request.domain.repository.ServiceRequestAttachmentRepository;
import com.allme.back.request.domain.repository.ServiceRequestRepository;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserDisplayQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.ArrayList;
import java.util.Collection;
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
 * 서비스 요청 유스케이스 — 회원의 참고 사진 업로드·요청 등록·내 요청 조회.
 * 첨부는 2단계: 폼에서 사진을 먼저 임시 파일로 올리고(uploadAttachment), 제출 시 같은 트랜잭션에서
 * 정식 파일로 승격(submit)한다. 제출하지 않은 임시 파일은 청소 스케줄러가 유예(24h) 후 정리한다.
 * user·file 도메인에는 리포지토리 인터페이스·FileService로만 의존한다.
 */
@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    public static final int MAX_ATTACHMENTS = 5;

    /** 목록 페이지 크기 상한 — 과대 요청 방지 */
    private static final int MAX_PAGE_SIZE = 50;

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final ServiceRequestRepository requestRepository;
    private final ServiceRequestAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final UserDisplayQueryRepository userDisplayQueryRepository;
    private final FileService fileService;

    /** 첨부 표시용 — 파일 id와 서빙 URL 경로(/images/...) */
    public record Attachment(Long fileId, String url) { }

    /**
     * 참고 사진 임시 업로드 — 확장자·내용 검사(R006) 후 임시 레코드(별도 트랜잭션 커밋) + 디스크 저장.
     * 승격은 submit에서. 반환된 임시 파일의 storedPath로 즉시 미리보기(/images/**)가 가능하다.
     */
    public UploadTempFile uploadAttachment(
        Long userId, byte[] content, String extension, String originalFilename
    ) {
        requireActiveUser(userId);
        if (content == null || content.length == 0
            || extension == null || !IMAGE_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new AppException(ServiceRequestErrorCode.ATTACHMENT_INVALID);
        }
        UploadTempFile temp = fileService.createTemp(
            FilePurpose.SERVICE_REQUEST, originalFilename, content.length, extension.toLowerCase(), userId);
        fileService.storeContent(temp, content);
        return temp;
    }

    /**
     * 요청 등록 — 탈퇴·부재 회원은 U011, 정합성 규칙은 엔티티(R002~R004), 첨부 초과는 R005.
     * 임시 파일은 본인·SERVICE_REQUEST 용도만 승격되며, 만료·타인·미존재(F001)는 R006으로 바꿔 알린다.
     * 중복 id는 한 번만 붙인다.
     */
    @Transactional
    public ServiceRequest submit(Long userId, ServiceRequestSubmitCommand command) {
        requireActiveUser(userId);

        List<Long> tempFileIds = command.attachmentTempFileIds() == null
            ? List.of()
            : new ArrayList<>(new LinkedHashSet<>(command.attachmentTempFileIds()));
        if (tempFileIds.size() > MAX_ATTACHMENTS) {
            throw new AppException(ServiceRequestErrorCode.ATTACHMENT_LIMIT);
        }

        ServiceRequest request = requestRepository.save(ServiceRequest.create(
            userId, command.category(), command.title(), command.content(),
            command.region(), command.addressDetail(),
            command.preferredDate(), command.scheduleNegotiable(),
            command.budgetMin(), command.budgetMax(), command.budgetNegotiable(),
            command.unitValue()
        ));

        List<ServiceRequestAttachment> attachments = new ArrayList<>();
        for (int i = 0; i < tempFileIds.size(); i++) {
            Long fileId = promoteAttachment(tempFileIds.get(i), userId);
            attachments.add(ServiceRequestAttachment.create(request.getId(), fileId, i));
        }
        if (!attachments.isEmpty()) {
            attachmentRepository.saveAll(attachments);
        }
        return request;
    }

    /** 내 요청 1건 — 타인 요청은 존재를 노출하지 않고 R001. */
    public ServiceRequest getMine(Long userId, Long requestId) {
        return requestRepository.findByIdAndUserId(requestId, userId)
            .orElseThrow(() -> new AppException(ServiceRequestErrorCode.REQUEST_NOT_FOUND));
    }

    /** 내 요청 목록 — 최신순. */
    public Page<ServiceRequest> getMyPage(Long userId, int page, int size) {
        return requestRepository.findPageByUserId(userId, pageable(page, size));
    }

    /** 공개 목록 — 모집 중 요청, 카테고리 null이면 전체, 최신순. */
    public Page<ServiceRequest> getOpenPage(ServiceCategory categoryOrNull, int page, int size) {
        return requestRepository.findOpenPage(categoryOrNull, pageable(page, size));
    }

    /** 공개 상세 — 없거나 삭제면 R001. 마감(CLOSED)된 요청도 조회는 된다(상세에서 마감 표시). */
    public ServiceRequest getOpen(Long requestId) {
        return requestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ServiceRequestErrorCode.REQUEST_NOT_FOUND));
    }

    /** 여러 요청 배치 조회 — 보낸 제안 목록 조립용. */
    public List<ServiceRequest> findAllByIds(Collection<Long> ids) {
        return requestRepository.findAllByIdIn(ids);
    }

    /** 표시용 닉네임 배치 조회 — 컨트롤러의 응답 조립용(행당 쿼리 금지). */
    public Map<Long, String> nicknamesOf(Collection<Long> userIds) {
        return userDisplayQueryRepository.findNicknamesByUserIds(userIds);
    }

    /** 요청의 첨부 목록(표시 순서) — 파일 경로는 한 번의 배치 조회로 채운다. 깨진 파일 참조는 건너뛴다. */
    public List<Attachment> attachmentsOf(Long requestId) {
        List<ServiceRequestAttachment> attachments =
            attachmentRepository.findAllByRequestIdOrderBySortOrder(requestId);
        if (attachments.isEmpty()) {
            return List.of();
        }
        Map<Long, String> paths = fileService.getStoredPaths(
            attachments.stream().map(ServiceRequestAttachment::getFileId).toList());
        return attachments.stream()
            .filter(a -> paths.containsKey(a.getFileId()))
            .map(a -> new Attachment(a.getFileId(), toImageUrl(paths.get(a.getFileId()))))
            .toList();
    }

    /** 저장 상대경로 → 서빙 URL 경로 (WebConfig의 /images/** 리소스 핸들러와 계약) */
    public static String toImageUrl(String storedPath) {
        return "/images/" + storedPath;
    }

    private Long promoteAttachment(Long tempFileId, Long userId) {
        try {
            return fileService.promote(tempFileId, userId, FilePurpose.SERVICE_REQUEST);
        } catch (AppException e) {
            if (e.getErrorCode() == FileErrorCode.TEMP_FILE_NOT_FOUND) {
                throw new AppException(ServiceRequestErrorCode.ATTACHMENT_INVALID);
            }
            throw e;
        }
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
