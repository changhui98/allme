package com.allme.back.provider.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.file.FileTestStubs.InMemoryUploadFileRepository;
import com.allme.back.file.FileTestStubs.InMemoryUploadTempFileRepository;
import com.allme.back.file.FileTestStubs.RecordingFileStorage;
import com.allme.back.file.application.service.FileService;
import com.allme.back.global.exception.AppException;
import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.ProviderErrorCode;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.provider.domain.entity.ProviderRevocation;
import com.allme.back.provider.domain.repository.ProviderApplicationRepository;
import com.allme.back.provider.domain.repository.ProviderRevocationRepository;
import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.time.Clock;
import java.time.ZoneId;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

class ProviderServiceTest {

    private ProviderService serviceWith(User user, Set<Role> roles, ProviderApplication approvedOrNull) {
        ProviderApplicationRepository applicationRepository = new ProviderApplicationRepository() {
            @Override public ProviderApplication save(ProviderApplication application) { return application; }
            @Override public Optional<ProviderApplication> findById(Long id) { return Optional.empty(); }
            @Override public Optional<ProviderApplication> findLatestByUserId(Long userId) { return Optional.ofNullable(approvedOrNull); }
            @Override public boolean existsByUserIdAndStatus(Long userId, ApplicationStatus status) { return false; }
            @Override public Optional<ProviderApplication> findLatestApprovedByUserId(Long userId) { return Optional.ofNullable(approvedOrNull); }
            @Override public List<ProviderApplication> findApprovedByUserIds(Collection<Long> userIds) { return List.of(); }
            @Override public Page<ProviderApplication> findPage(ApplicationStatus statusOrNull, Pageable pageable) { return Page.empty(); }
            @Override public long countByStatus(ApplicationStatus status) { return 0; }
            @Override public long count() { return 0; }
        };
        ProviderRevocationRepository revocationRepository = revocation -> revocation;
        UserRepository userRepository = new UserRepository() {
            @Override public boolean existsByLoginId(String loginId) { return false; }
            @Override public boolean existsByCiHash(String ciHash) { return false; }
            @Override public boolean existsByNickname(String nickname) { return false; }
            @Override public List<User> findAllWithoutNickname() { return List.of(); }
            @Override public Optional<User> findById(Long id) { return Optional.ofNullable(user); }
            @Override public Optional<User> findByLoginId(String loginId) { return Optional.empty(); }
            @Override public User save(User u) { return u; }
        };
        UserAdminQueryRepository adminQueryRepository = new UserAdminQueryRepository() {
            @Override public Map<Long, String> findLoginIdsByUserIds(Collection<Long> userIds) { return Map.of(); }
            @Override public Page<AdminUserRow> search(String k, Role r, Pageable pageable) { return Page.empty(); }
            @Override public Map<Long, Set<Role>> findRolesByUserIds(Collection<Long> userIds) { return Map.of(1L, roles); }
            @Override public long countActive() { return 0; }
            @Override public long countByRole(Role role) { return 0; }
        };
        FileService fileService = new FileService(
            new InMemoryUploadFileRepository(), new InMemoryUploadTempFileRepository(),
            new RecordingFileStorage(), Clock.system(ZoneId.of("Asia/Seoul")));
        return new ProviderService(
            applicationRepository, revocationRepository, userRepository, adminQueryRepository, fileService);
    }

    private static User providerUser() {
        User user = User.create(
            "biz123", "encoded", "김업체", "성실한 업체", "ci", "ci-hash", null, "01012345678", false);
        user.grantRole(Role.USER);
        user.grantRole(Role.PROVIDER);
        return user;
    }

    @Test
    @DisplayName("공개 프로필은 닉네임과 최신 승인 신청서의 업체명·소개를 담고, 신청서가 없으면 null로 둔다")
    void getPublicProfile() {
        ProviderApplication approved = ProviderApplication.create(1L, "클린하우스", "1234567890", "소개", "01000000000");
        approved.approve(99L);

        ProviderService.PublicProfile profile = serviceWith(providerUser(), Set.of(Role.USER, Role.PROVIDER), approved)
            .getPublicProfile(1L);
        assertThat(profile.nickname()).isEqualTo("성실한 업체");
        assertThat(profile.profileImagePath()).isNull();
        assertThat(profile.application().getBusinessName()).isEqualTo("클린하우스");

        ProviderService.PublicProfile noApplication = serviceWith(providerUser(), Set.of(Role.USER, Role.PROVIDER), null)
            .getPublicProfile(1L);
        assertThat(noApplication.application()).isNull();
    }

    @Test
    @DisplayName("PROVIDER 역할이 없거나 탈퇴한 회원의 공개 프로필은 P006")
    void getPublicProfile_notActiveProvider() {
        assertThatThrownBy(() -> serviceWith(providerUser(), Set.of(Role.USER), null).getPublicProfile(1L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProviderErrorCode.NOT_ACTIVE_PROVIDER);

        User withdrawn = providerUser();
        withdrawn.withdraw();
        assertThatThrownBy(() -> serviceWith(withdrawn, Set.of(Role.USER, Role.PROVIDER), null).getPublicProfile(1L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProviderErrorCode.NOT_ACTIVE_PROVIDER);
    }

}
