package com.allme.back.listing.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.file.FileTestStubs.InMemoryUploadFileRepository;
import com.allme.back.file.FileTestStubs.InMemoryUploadTempFileRepository;
import com.allme.back.file.FileTestStubs.RecordingFileStorage;
import com.allme.back.file.application.service.FileService;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.global.exception.AppException;
import com.allme.back.listing.application.service.ServiceListingCommand.ImageRef;
import com.allme.back.listing.domain.ServiceListingErrorCode;
import com.allme.back.listing.domain.ServiceListingStatus;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.listing.domain.entity.ServiceListingImage;
import com.allme.back.listing.domain.repository.ServiceListingImageRepository;
import com.allme.back.listing.domain.repository.ServiceListingRepository;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserDisplayQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.time.Clock;
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

class ServiceListingServiceTest {

    private final List<ServiceListing> savedListings = new ArrayList<>();
    private final List<ServiceListingImage> savedImages = new ArrayList<>();
    private final InMemoryUploadFileRepository fileRepository = new InMemoryUploadFileRepository();
    private final InMemoryUploadTempFileRepository tempRepository = new InMemoryUploadTempFileRepository();
    private final RecordingFileStorage storage = new RecordingFileStorage();
    private final FileService fileService = new FileService(
        fileRepository, tempRepository, storage, Clock.system(ZoneId.of("Asia/Seoul")));

    private ServiceListingService serviceWith(User existingUser) {
        ServiceListingRepository listingRepository = new ServiceListingRepository() {
            private long nextId = 1;
            @Override public ServiceListing save(ServiceListing listing) {
                ReflectionTestUtils.setField(listing, "id", nextId++);
                savedListings.add(listing);
                return listing;
            }
            @Override public Optional<ServiceListing> findByIdAndProviderUserId(Long id, Long providerUserId) {
                return savedListings.stream()
                    .filter(l -> !l.isDeleted())
                    .filter(l -> l.getId().equals(id) && l.getProviderUserId().equals(providerUserId))
                    .findFirst();
            }
            @Override public Page<ServiceListing> findPageByProviderUserId(Long providerUserId, Pageable pageable) {
                return new PageImpl<>(savedListings.stream()
                    .filter(l -> !l.isDeleted())
                    .filter(l -> l.getProviderUserId().equals(providerUserId)).toList());
            }
            @Override public Page<ServiceListing> findPublishedPage(
                ServiceCategory categoryOrNull, String keywordOrNull, Pageable pageable
            ) {
                return new PageImpl<>(savedListings.stream()
                    .filter(l -> !l.isDeleted() && l.isPublished())
                    .filter(l -> categoryOrNull == null || l.getCategory() == categoryOrNull)
                    .filter(l -> keywordOrNull == null
                        || l.getTitle().contains(keywordOrNull) || l.getSummary().contains(keywordOrNull))
                    .toList());
            }
            @Override public Optional<ServiceListing> findPublishedById(Long id) {
                return savedListings.stream()
                    .filter(l -> !l.isDeleted() && l.isPublished() && l.getId().equals(id))
                    .findFirst();
            }
            @Override public Page<ServiceListing> findPublishedPageByProviderUserId(
                Long providerUserId, Pageable pageable
            ) {
                return new PageImpl<>(savedListings.stream()
                    .filter(l -> !l.isDeleted() && l.isPublished())
                    .filter(l -> l.getProviderUserId().equals(providerUserId)).toList());
            }
        };
        ServiceListingImageRepository imageRepository = new ServiceListingImageRepository() {
            private long nextId = 1;
            @Override public List<ServiceListingImage> saveAll(List<ServiceListingImage> images) {
                for (ServiceListingImage image : images) {
                    ReflectionTestUtils.setField(image, "id", nextId++);
                }
                savedImages.addAll(images);
                return images;
            }
            @Override public List<ServiceListingImage> findAllByListingIdOrderBySortOrder(Long listingId) {
                return savedImages.stream()
                    .filter(i -> i.getListingId().equals(listingId))
                    .sorted(Comparator.comparingInt(ServiceListingImage::getSortOrder))
                    .toList();
            }
            @Override public List<ServiceListingImage> findAllByListingIdInOrderBySortOrder(
                Collection<Long> listingIds
            ) {
                return savedImages.stream()
                    .filter(i -> listingIds.contains(i.getListingId()))
                    .sorted(Comparator.comparingInt(ServiceListingImage::getSortOrder))
                    .toList();
            }
            @Override public void deleteAllByListingId(Long listingId) {
                savedImages.removeIf(i -> i.getListingId().equals(listingId));
            }
        };
        UserDisplayQueryRepository displayQueryRepository = userIds -> Map.of();
        UserRepository userRepository = new UserRepository() {
            @Override public boolean existsByLoginId(String loginId) { return false; }
            @Override public boolean existsByCiHash(String ciHash) { return false; }
            @Override public boolean existsByNickname(String nickname) { return false; }
            @Override public List<User> findAllWithoutNickname() { return List.of(); }
            @Override public Optional<User> findById(Long id) { return Optional.ofNullable(existingUser); }
            @Override public Optional<User> findByLoginId(String loginId) { return Optional.empty(); }
            @Override public User save(User user) { return user; }
        };
        return new ServiceListingService(
            listingRepository, imageRepository, userRepository, displayQueryRepository, fileService);
    }

    private static User activeUser() {
        return User.create(
            "allme123", "encoded", "홍길동", "닉네임", "ci", "ci-hash", null, "01012345678", false);
    }

    private static ServiceListingCommand command(List<ImageRef> images) {
        return new ServiceListingCommand(
            ServiceCategory.CLEANING, "입주청소", "한 줄 소개", "상세 설명",
            List.of(Region.GANGNAM, Region.SEOCHO), 150_000L, false, "3~4시간", 10, images);
    }

    private static ImageRef temp(Long tempFileId) {
        return new ImageRef(null, tempFileId);
    }

    private static ImageRef kept(Long fileId) {
        return new ImageRef(fileId, null);
    }

    @Test
    @DisplayName("사진 업로드는 PROVIDER_SERVICE 용도의 임시 파일을 만들고, 무효 확장자·빈 파일은 S005")
    void uploadImage() {
        ServiceListingService service = serviceWith(activeUser());
        UploadTempFile temp = service.uploadImage(1L, new byte[] {1, 2}, "JPG", "사진.JPG");

        assertThat(temp.getPurpose()).isEqualTo(FilePurpose.PROVIDER_SERVICE);
        assertThat(temp.getStoredPath()).startsWith("service/service_");
        assertThat(storage.files).containsKey(temp.getStoredPath());

        assertThatThrownBy(() -> service.uploadImage(1L, new byte[] {1}, "gif", "a.gif"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.IMAGE_INVALID);
        assertThatThrownBy(() -> service.uploadImage(1L, new byte[0], "png", "a.png"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.IMAGE_INVALID);
    }

    @Test
    @DisplayName("등록 시 임시 파일이 순서대로 승격돼 사진으로 연결되고, 중복 참조는 한 번만 붙는다")
    void create_promotesImagesInOrder() {
        ServiceListingService service = serviceWith(activeUser());
        UploadTempFile first = service.uploadImage(1L, new byte[] {1}, "jpg", "1.jpg");
        UploadTempFile second = service.uploadImage(1L, new byte[] {2}, "png", "2.png");

        ServiceListing listing = service.create(
            1L, command(List.of(temp(second.getId()), temp(first.getId()), temp(second.getId()))));

        assertThat(tempRepository.store).isEmpty();
        assertThat(fileRepository.store).hasSize(2);
        List<ServiceListingService.Image> images = service.imagesOf(listing.getId());
        assertThat(images).hasSize(2);
        assertThat(images.get(0).url()).isEqualTo("/images/" + second.getStoredPath());
        assertThat(images.get(1).url()).isEqualTo("/images/" + first.getStoredPath());
        assertThat(service.thumbnailsOf(List.of(listing.getId())))
            .containsEntry(listing.getId(), "/images/" + second.getStoredPath());
    }

    @Test
    @DisplayName("사진이 5장을 넘으면 S004, 등록에서 기존 파일 참조(fileId)는 S005")
    void create_imageLimitAndForeignFileId() {
        ServiceListingService service = serviceWith(activeUser());

        assertThatThrownBy(() -> service.create(1L, command(
            List.of(temp(1L), temp(2L), temp(3L), temp(4L), temp(5L), temp(6L)))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.IMAGE_LIMIT);

        assertThatThrownBy(() -> service.create(1L, command(List.of(kept(1L)))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.IMAGE_INVALID);
    }

    @Test
    @DisplayName("타인의 임시 파일이나 없는 임시 파일은 S005")
    void create_foreignOrUnknownTemp() {
        ServiceListingService service = serviceWith(activeUser());
        UploadTempFile others = service.uploadImage(2L, new byte[] {1}, "jpg", "x.jpg");

        assertThatThrownBy(() -> service.create(1L, command(List.of(temp(others.getId())))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.IMAGE_INVALID);
        assertThatThrownBy(() -> service.create(1L, command(List.of(temp(999L)))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.IMAGE_INVALID);
    }

    @Test
    @DisplayName("수정은 유지한 파일을 남기고 빠진 파일을 디스크까지 지우며, 새 임시 파일을 승격한다")
    void update_replacesImages() {
        ServiceListingService service = serviceWith(activeUser());
        UploadTempFile first = service.uploadImage(1L, new byte[] {1}, "jpg", "1.jpg");
        UploadTempFile second = service.uploadImage(1L, new byte[] {2}, "png", "2.png");
        ServiceListing listing = service.create(
            1L, command(List.of(temp(first.getId()), temp(second.getId()))));

        List<ServiceListingService.Image> images = service.imagesOf(listing.getId());
        Long keptFileId = images.get(1).fileId();
        Long droppedFileId = images.get(0).fileId();
        UploadTempFile added = service.uploadImage(1L, new byte[] {3}, "webp", "3.webp");

        service.update(1L, listing.getId(), command(List.of(temp(added.getId()), kept(keptFileId))));

        List<ServiceListingService.Image> updated = service.imagesOf(listing.getId());
        assertThat(updated).hasSize(2);
        assertThat(updated.get(0).url()).isEqualTo("/images/" + added.getStoredPath());
        assertThat(updated.get(1).fileId()).isEqualTo(keptFileId);
        assertThat(fileRepository.store).doesNotContainKey(droppedFileId);
        assertThat(storage.files).doesNotContainKey(first.getStoredPath());
    }

    @Test
    @DisplayName("수정에서 내 서비스가 소유하지 않은 fileId는 S005, 타인 서비스 수정은 S001")
    void update_ownership() {
        ServiceListingService service = serviceWith(activeUser());
        ServiceListing listing = service.create(1L, command(null));

        assertThatThrownBy(() -> service.update(1L, listing.getId(), command(List.of(kept(999L)))))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.IMAGE_INVALID);
        assertThatThrownBy(() -> service.update(2L, listing.getId(), command(null)))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.LISTING_NOT_FOUND);
    }

    @Test
    @DisplayName("숨김 서비스는 공개 목록·상세·업체 목록에서 빠지고 내 서비스에는 남는다. 삭제 후엔 S001")
    void hideAndDelete() {
        ServiceListingService service = serviceWith(activeUser());
        ServiceListing listing = service.create(1L, command(null));

        service.hide(1L, listing.getId());
        assertThat(service.getPublishedPage(null, null, 0, 20).getContent()).isEmpty();
        assertThat(service.getPublishedByProvider(1L)).isEmpty();
        assertThatThrownBy(() -> service.getPublished(listing.getId()))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.LISTING_NOT_FOUND);
        assertThat(service.getMyPage(1L, 0, 20).getContent()).hasSize(1);
        assertThat(listing.getStatus()).isEqualTo(ServiceListingStatus.HIDDEN);

        service.publish(1L, listing.getId());
        assertThat(service.getPublishedPage(ServiceCategory.CLEANING, "입주", 0, 20).getContent()).hasSize(1);

        service.delete(1L, listing.getId());
        assertThatThrownBy(() -> service.getMine(1L, listing.getId()))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.LISTING_NOT_FOUND);
    }

    @Test
    @DisplayName("탈퇴한 회원의 등록·업로드는 U011로 차단된다")
    void create_withdrawnUser_unauthorized() {
        User withdrawn = activeUser();
        withdrawn.withdraw();
        ServiceListingService service = serviceWith(withdrawn);

        assertThatThrownBy(() -> service.create(1L, command(null)))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
        assertThatThrownBy(() -> service.uploadImage(1L, new byte[] {1}, "jpg", "a.jpg"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

}
