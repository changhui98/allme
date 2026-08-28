package com.allme.back.request.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.file.FileTestStubs.InMemoryUploadFileRepository;
import com.allme.back.file.FileTestStubs.InMemoryUploadTempFileRepository;
import com.allme.back.file.FileTestStubs.RecordingFileStorage;
import com.allme.back.file.application.service.FileService;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.global.exception.AppException;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.ServiceRequestStatus;
import com.allme.back.request.domain.ServiceRequestErrorCode;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.request.domain.entity.ServiceRequestAttachment;
import com.allme.back.request.domain.repository.ServiceRequestAttachmentRepository;
import com.allme.back.request.domain.repository.ServiceRequestRepository;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserDisplayQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

class ServiceRequestServiceTest {

    private static final LocalDate DATE = LocalDate.of(2026, 9, 1);

    private final List<ServiceRequest> savedRequests = new ArrayList<>();
    private final List<ServiceRequestAttachment> savedAttachments = new ArrayList<>();
    private final InMemoryUploadFileRepository fileRepository = new InMemoryUploadFileRepository();
    private final InMemoryUploadTempFileRepository tempRepository = new InMemoryUploadTempFileRepository();
    private final RecordingFileStorage storage = new RecordingFileStorage();
    private final FileService fileService = new FileService(
        fileRepository, tempRepository, storage, Clock.system(ZoneId.of("Asia/Seoul")));

    private ServiceRequestService serviceWith(User existingUser) {
        ServiceRequestRepository requestRepository = new ServiceRequestRepository() {
            private long nextId = 1;
            @Override public ServiceRequest save(ServiceRequest request) {
                ReflectionTestUtils.setField(request, "id", nextId++);
                savedRequests.add(request);
                return request;
            }
            @Override public Optional<ServiceRequest> findById(Long id) {
                return savedRequests.stream().filter(r -> r.getId().equals(id)).findFirst();
            }
            @Override public Optional<ServiceRequest> findByIdAndUserId(Long id, Long userId) {
                return savedRequests.stream()
                    .filter(r -> r.getId().equals(id) && r.getUserId().equals(userId)).findFirst();
            }
            @Override public Page<ServiceRequest> findPageByUserId(Long userId, Pageable pageable) {
                return new PageImpl<>(savedRequests.stream().filter(r -> r.getUserId().equals(userId)).toList());
            }
            @Override public Page<ServiceRequest> findOpenPage(ServiceCategory categoryOrNull, Pageable pageable) {
                return new PageImpl<>(savedRequests.stream()
                    .filter(r -> r.getStatus() == ServiceRequestStatus.OPEN)
                    .filter(r -> categoryOrNull == null || r.getCategory() == categoryOrNull)
                    .toList());
            }
            @Override public List<ServiceRequest> findAllByIdIn(Collection<Long> ids) {
                return savedRequests.stream().filter(r -> ids.contains(r.getId())).toList();
            }
        };
        UserDisplayQueryRepository displayQueryRepository = userIds -> Map.of();
        ServiceRequestAttachmentRepository attachmentRepository = new ServiceRequestAttachmentRepository() {
            @Override public List<ServiceRequestAttachment> saveAll(List<ServiceRequestAttachment> attachments) {
                savedAttachments.addAll(attachments);
                return attachments;
            }
            @Override public List<ServiceRequestAttachment> findAllByRequestIdOrderBySortOrder(Long requestId) {
                return savedAttachments.stream()
                    .filter(a -> a.getRequestId().equals(requestId))
                    .sorted(Comparator.comparingInt(ServiceRequestAttachment::getSortOrder))
                    .toList();
            }
        };
        UserRepository userRepository = new UserRepository() {
            @Override public boolean existsByLoginId(String loginId) { return false; }
            @Override public boolean existsByCiHash(String ciHash) { return false; }
            @Override public boolean existsByNickname(String nickname) { return false; }
            @Override public List<User> findAllWithoutNickname() { return List.of(); }
            @Override public Optional<User> findById(Long id) { return Optional.ofNullable(existingUser); }
            @Override public Optional<User> findByLoginId(String loginId) { return Optional.empty(); }
            @Override public User save(User user) { return user; }
        };
        return new ServiceRequestService(
            requestRepository, attachmentRepository, userRepository, displayQueryRepository, fileService);
    }

    private static User activeUser() {
        return User.create(
            "allme123", "encoded", "홍길동", "닉네임", "ci", "ci-hash", null, "01012345678", false);
    }

    private static ServiceRequestSubmitCommand command(List<Long> tempFileIds) {
        return new ServiceRequestSubmitCommand(
            ServiceCategory.CLEANING, "제목", "내용", Region.GWANAK, "101동",
            DATE, false, 150_000L, 200_000L, false, 24, tempFileIds);
    }

    @Test
    @DisplayName("참고 사진 업로드는 SERVICE_REQUEST 용도의 임시 파일을 만들고 디스크에 저장한다")
    void uploadAttachment_createsTemp() {
        UploadTempFile temp = serviceWith(activeUser())
            .uploadAttachment(1L, new byte[] {1, 2}, "JPG", "현장.JPG");

        assertThat(temp.getPurpose()).isEqualTo(FilePurpose.SERVICE_REQUEST);
        assertThat(temp.getExtension()).isEqualTo("jpg");
        assertThat(temp.getStoredPath()).startsWith("request/request_");
        assertThat(storage.files).containsKey(temp.getStoredPath());
    }

    @Test
    @DisplayName("허용되지 않는 확장자나 빈 파일은 R006")
    void uploadAttachment_invalid() {
        ServiceRequestService service = serviceWith(activeUser());

        assertThatThrownBy(() -> service.uploadAttachment(1L, new byte[] {1}, "gif", "a.gif"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.ATTACHMENT_INVALID);
        assertThatThrownBy(() -> service.uploadAttachment(1L, new byte[0], "png", "a.png"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.ATTACHMENT_INVALID);
    }

    @Test
    @DisplayName("제출 시 임시 파일이 순서대로 승격돼 첨부로 연결되고, 중복 id는 한 번만 붙는다")
    void submit_promotesAttachmentsInOrder() {
        ServiceRequestService service = serviceWith(activeUser());
        UploadTempFile first = service.uploadAttachment(1L, new byte[] {1}, "jpg", "1.jpg");
        UploadTempFile second = service.uploadAttachment(1L, new byte[] {2}, "png", "2.png");

        ServiceRequest request = service.submit(
            1L, command(List.of(second.getId(), first.getId(), second.getId())));

        assertThat(savedRequests).containsExactly(request);
        assertThat(tempRepository.store).isEmpty();
        assertThat(fileRepository.store).hasSize(2);
        List<ServiceRequestService.Attachment> attachments = service.attachmentsOf(request.getId());
        assertThat(attachments).hasSize(2);
        assertThat(attachments.get(0).url()).isEqualTo("/images/" + second.getStoredPath());
        assertThat(attachments.get(1).url()).isEqualTo("/images/" + first.getStoredPath());
    }

    @Test
    @DisplayName("첨부 없이도 제출되며 첨부 목록은 비어 있다")
    void submit_withoutAttachments() {
        ServiceRequestService service = serviceWith(activeUser());

        ServiceRequest request = service.submit(1L, command(null));

        assertThat(service.attachmentsOf(request.getId())).isEmpty();
        assertThat(savedAttachments).isEmpty();
    }

    @Test
    @DisplayName("첨부가 5장을 넘으면 R005")
    void submit_tooManyAttachments() {
        assertThatThrownBy(() -> serviceWith(activeUser())
            .submit(1L, command(List.of(1L, 2L, 3L, 4L, 5L, 6L))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.ATTACHMENT_LIMIT);
    }

    @Test
    @DisplayName("타인의 임시 파일이나 없는 임시 파일을 첨부하면 R006")
    void submit_foreignOrUnknownTemp() {
        ServiceRequestService service = serviceWith(activeUser());
        UploadTempFile others = service.uploadAttachment(2L, new byte[] {1}, "jpg", "x.jpg");

        assertThatThrownBy(() -> service.submit(1L, command(List.of(others.getId()))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.ATTACHMENT_INVALID);
        assertThatThrownBy(() -> service.submit(1L, command(List.of(999L))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.ATTACHMENT_INVALID);
    }

    @Test
    @DisplayName("탈퇴한 회원의 제출·업로드는 U011로 차단된다")
    void submit_withdrawnUser_unauthorized() {
        User withdrawn = activeUser();
        withdrawn.withdraw();
        ServiceRequestService service = serviceWith(withdrawn);

        assertThatThrownBy(() -> service.submit(1L, command(null)))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
        assertThatThrownBy(() -> service.uploadAttachment(1L, new byte[] {1}, "jpg", "a.jpg"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

    @Test
    @DisplayName("공개 목록은 모집 중 요청만, 카테고리로 거를 수 있다")
    void getOpenPage_filtersByCategory() {
        ServiceRequestService service = serviceWith(activeUser());
        service.submit(1L, command(null));
        ServiceRequest web = service.submit(1L, new ServiceRequestSubmitCommand(
            ServiceCategory.WEB_DESIGN, "웹", "내용", Region.ONLINE, null,
            null, true, null, null, true, null, null));

        assertThat(service.getOpenPage(null, 0, 20).getContent()).hasSize(2);
        assertThat(service.getOpenPage(ServiceCategory.WEB_DESIGN, 0, 20).getContent()).containsExactly(web);
        assertThat(service.getOpen(web.getId())).isSameAs(web);
    }

    @Test
    @DisplayName("타인의 요청을 내 요청으로 조회하면 존재를 숨기고 R001을 던진다")
    void getMine_othersRequest_notFound() {
        ServiceRequestService service = serviceWith(activeUser());
        ServiceRequest request = service.submit(1L, command(null));

        assertThat(service.getMine(1L, request.getId())).isSameAs(request);
        assertThatThrownBy(() -> service.getMine(2L, request.getId()))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.REQUEST_NOT_FOUND);
    }

}
