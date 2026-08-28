package com.allme.back.provider.application.service;

import com.allme.back.file.application.service.FileService;
import com.allme.back.global.exception.AppException;
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
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 활동 업체 관리 유스케이스 — "활동 중인 업체"는 PROVIDER 역할을 보유한 회원이다(신청서 상태가 아니라 역할이 기준).
 * 업체명·사업자번호 등 표시 정보는 그 회원의 최신 승인 신청서에서 가져오며, 수동 역할 부여 회원은 신청서가 없을 수 있다.
 * 신청 심사(ProviderApplicationService)와 관심사를 분리한다.
 */
@Service
@RequiredArgsConstructor
public class ProviderService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ProviderApplicationRepository applicationRepository;
    private final ProviderRevocationRepository revocationRepository;
    private final UserRepository userRepository;
    private final UserAdminQueryRepository userAdminQueryRepository;
    private final FileService fileService;

    /** 활동 업체 목록 — PROVIDER 보유 회원, 최신순(id desc). 개인정보 컬럼은 로딩하지 않는 프로젝션. */
    public Page<AdminUserRow> getActivePage(int page, int size) {
        PageRequest pageable = PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "id")
        );
        return userAdminQueryRepository.search(null, Role.PROVIDER, pageable);
    }

    /** 회원별 최신 승인 신청서 — 목록 조립용 배치 조회(id desc라 회원당 첫 행이 최신). */
    public Map<Long, ProviderApplication> latestApprovedByUserIds(Collection<Long> userIds) {
        Map<Long, ProviderApplication> latest = new HashMap<>();
        for (ProviderApplication application : applicationRepository.findApprovedByUserIds(userIds)) {
            latest.putIfAbsent(application.getUserId(), application);
        }
        return latest;
    }

    /** 활동 업체 1건 — PROVIDER 미보유(탈퇴 포함 — 탈퇴 시 역할 전부 회수)면 P006. User 엔티티는 로딩하지 않는다. */
    public ActiveProvider getActive(Long userId) {
        requireProviderRole(userId);
        String loginId = userAdminQueryRepository.findLoginIdsByUserIds(List.of(userId)).get(userId);
        Optional<ProviderApplication> application = applicationRepository.findLatestApprovedByUserId(userId);
        return new ActiveProvider(userId, loginId, application.orElse(null));
    }

    /**
     * 업체 자격 해제 — PROVIDER 역할 회수(즉시 반영 — 인가 가드가 매 요청 역할을 DB 조회)와 사유·처리자 이력을 한 트랜잭션으로.
     * 승인 신청서 상태는 건드리지 않는다(이력 보존). 해제된 회원은 새 신청으로 재신청할 수 있다.
     */
    @Transactional
    public void revoke(Long userId, Long adminUserId, String reason) {
        User user = userRepository.findById(userId)
            .filter(found -> !found.isDeleted())
            .orElseThrow(() -> new AppException(ProviderErrorCode.NOT_ACTIVE_PROVIDER));
        if (!user.hasRole(Role.PROVIDER)) {
            throw new AppException(ProviderErrorCode.NOT_ACTIVE_PROVIDER);
        }

        user.revokeRole(Role.PROVIDER);
        Long applicationId = applicationRepository.findLatestApprovedByUserId(userId)
            .map(ProviderApplication::getId)
            .orElse(null);
        revocationRepository.save(ProviderRevocation.create(userId, applicationId, reason, adminUserId));
    }

    /**
     * 공개 업체 프로필 — 제안을 받은 클라이언트 등 누구나 보는 정보(닉네임·프로필 사진·업체명·소개·활동 시작일).
     * PROVIDER 미보유·탈퇴면 P006. 사업자번호·연락처·loginId·실명은 응답 DTO가 내리지 않는다.
     */
    public PublicProfile getPublicProfile(Long userId) {
        requireProviderRole(userId);
        User user = userRepository.findById(userId)
            .filter(found -> !found.isDeleted())
            .orElseThrow(() -> new AppException(ProviderErrorCode.NOT_ACTIVE_PROVIDER));
        String profileImagePath = user.getProfileImageFileId() != null
            ? fileService.getStoredPath(user.getProfileImageFileId())
            : null;
        return new PublicProfile(
            userId, user.getNickname(), profileImagePath,
            applicationRepository.findLatestApprovedByUserId(userId).orElse(null));
    }

    /** 표시용 loginId 배치 조회 — 컨트롤러의 응답 조립용. */
    public Map<Long, String> loginIdsOf(Collection<Long> userIds) {
        return userAdminQueryRepository.findLoginIdsByUserIds(userIds);
    }

    private void requireProviderRole(Long userId) {
        Set<Role> roles = userAdminQueryRepository.findRolesByUserIds(List.of(userId))
            .getOrDefault(userId, Set.of());
        if (!roles.contains(Role.PROVIDER)) {
            throw new AppException(ProviderErrorCode.NOT_ACTIVE_PROVIDER);
        }
    }

    /** 활동 업체 조회 결과 — application은 최신 승인 신청서(없으면 null). */
    public record ActiveProvider(Long userId, String loginId, ProviderApplication application) { }

    /** 공개 프로필 조회 결과 — application은 최신 승인 신청서(수동 역할 부여 회원은 null). */
    public record PublicProfile(
        Long userId, String nickname, String profileImagePath, ProviderApplication application
    ) { }

}
