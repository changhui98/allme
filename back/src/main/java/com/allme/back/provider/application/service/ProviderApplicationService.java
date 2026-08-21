package com.allme.back.provider.application.service;

import com.allme.back.global.exception.AppException;
import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.ProviderErrorCode;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.provider.domain.repository.ProviderApplicationRepository;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    private final ProviderApplicationRepository applicationRepository;
    private final UserRepository userRepository;

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

}
