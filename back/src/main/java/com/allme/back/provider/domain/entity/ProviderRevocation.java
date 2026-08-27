package com.allme.back.provider.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 업체 자격 해제 이력 — 매니저/관리자가 활동 중인 업체(PROVIDER 역할 보유 회원)의 자격을 해제한 기록.
 * 해제 자체는 User.revokeRole(PROVIDER)로 즉시 반영되고(매 요청 역할 조회), 이 행은 사유·처리자 감사 기록이다.
 * - 승인 신청서(provider_applications)의 상태는 바꾸지 않는다 — "승인됐었다"는 사실은 이력으로 보존하고,
 *   status enum에 값을 추가하면 기존 DB의 CHECK 제약(ddl-auto: update가 갱신 못 함)에 걸리기 때문.
 *   해제된 회원은 새 신청으로 재신청할 수 있다(submit 가드가 역할·PENDING만 본다).
 * - applicationId는 해제 시점의 최신 승인 신청서(수동 역할 부여 등으로 없을 수 있어 nullable). JPA 연관 없이 id 참조.
 * - 해제 시각은 BaseEntity.createdDate.
 */
@Entity
@Table(
    name = "provider_revocations",
    indexes = @Index(name = "idx_provider_revocations_user_id", columnList = "user_id")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProviderRevocation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "application_id")
    private Long applicationId;

    @Column(nullable = false, length = 500)
    private String reason;

    /** 해제를 처리한 매니저·관리자 user id */
    @Column(name = "revoked_by_user_id", nullable = false)
    private Long revokedByUserId;

    private ProviderRevocation(Long userId, Long applicationId, String reason, Long revokedByUserId) {
        this.userId = userId;
        this.applicationId = applicationId;
        this.reason = reason;
        this.revokedByUserId = revokedByUserId;
    }

    public static ProviderRevocation create(
        Long userId, Long applicationIdOrNull, String reason, Long revokedByUserId
    ) {
        return new ProviderRevocation(userId, applicationIdOrNull, reason, revokedByUserId);
    }

}
