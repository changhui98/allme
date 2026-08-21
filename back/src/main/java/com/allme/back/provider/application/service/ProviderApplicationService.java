package com.allme.back.provider.application.service;

import com.allme.back.global.exception.AppException;
import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.ProviderErrorCode;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.provider.domain.repository.ProviderApplicationRepository;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 업체 등록 신청 유스케이스.
 * user 도메인에는 리포지토리 인터페이스(UserRepository)로만 의존한다 —
 * UserService.getById는 부재/탈퇴를 U011(로그인 필요)로 던지는 인증 시맨틱이라 여기선 쓰지 않는다.
 */
@Service
@RequiredArgsConstructor
public class ProviderApplicationService {

    /** 목록 페이지 크기 상한 — 과대 요청 방지 */
    private static final int MAX_PAGE_SIZE = 50;

    private final ProviderApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final UserAdminQueryRepository userAdminQueryRepository;

    /**
     * 신청 제출. 이미 업체이거나(P003) 심사 대기 건이 있으면(P002) 차단한다.
     * 사업자등록번호는 하이픈을 제거해 숫자 10자리로 정규화 저장한다.
     */
    @Transactional
    public ProviderApplication submit(
        Long userId, String businessName, String businessRegistrationNumber,
        String introduction, String contactPhone
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(UserErrorCode.UNAUTHORIZED));
        if (user.isDeleted()) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
        if (user.hasRole(Role.PROVIDER)) {
            throw new AppException(ProviderErrorCode.ALREADY_PROVIDER);
        }
        if (applicationRepository.existsByUserIdAndStatus(userId, ApplicationStatus.PENDING)) {
            throw new AppException(ProviderErrorCode.APPLICATION_ALREADY_PENDING);
        }

        ProviderApplication application = ProviderApplication.create(
            userId,
            businessName,
            businessRegistrationNumber.replace("-", ""),
            introduction,
            contactPhone
        );
        return applicationRepository.save(application);
    }

    /** 내 최신 신청 — 반려 후 재신청하면 새 행이 최신이 된다. 없으면 P001. */
    public ProviderApplication getMyLatest(Long userId) {
        return applicationRepository.findLatestByUserId(userId)
            .orElseThrow(() -> new AppException(ProviderErrorCode.APPLICATION_NOT_FOUND));
    }

    /** 관리자 목록 — status가 null이면 전체, 신청 최신순(id desc) 고정. */
    public Page<ProviderApplication> getPage(ApplicationStatus statusOrNull, int page, int size) {
        PageRequest pageable = PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "id")
        );
        return applicationRepository.findPage(statusOrNull, pageable);
    }

    public ProviderApplication getById(Long applicationId) {
        return applicationRepository.findById(applicationId)
            .orElseThrow(() -> new AppException(ProviderErrorCode.APPLICATION_NOT_FOUND));
    }

    /**
     * 승인 — 신청 상태 전이와 신청자 PROVIDER 부여를 한 트랜잭션으로 묶는다(dirty checking).
     * 두 관리자가 동시에 승인해도 grantRole은 멱등이고 status 최종값이 같아 락 없이 무해하다.
     * 승인 즉시 PROVIDER API 사용 가능 — 인가 가드가 매 요청 역할을 DB 조회하므로 재로그인 불필요.
     */
    @Transactional
    public void approve(Long applicationId, Long adminUserId) {
        ProviderApplication application = getById(applicationId);
        User applicant = userRepository.findById(application.getUserId())
            .filter(user -> !user.isDeleted())
            .orElseThrow(() -> new AppException(ProviderErrorCode.APPLICANT_NOT_AVAILABLE));

        application.approve(adminUserId);
        applicant.grantRole(Role.PROVIDER);
    }

    /** 반려 — 사유를 남긴다. 반려된 신청자는 새 신청으로 재신청할 수 있다. */
    @Transactional
    public void reject(Long applicationId, Long adminUserId, String reason) {
        getById(applicationId).reject(adminUserId, reason);
    }

    /** 표시용 loginId 배치 조회 — 컨트롤러의 응답 조립용(행당 쿼리 금지). */
    public Map<Long, String> loginIdsOf(Collection<Long> userIds) {
        return userAdminQueryRepository.findLoginIdsByUserIds(userIds);
    }

    public long countByStatus(ApplicationStatus status) {
        return applicationRepository.countByStatus(status);
    }

    public long countAll() {
        return applicationRepository.count();
    }

}
