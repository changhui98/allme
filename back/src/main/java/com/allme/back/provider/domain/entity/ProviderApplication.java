package com.allme.back.provider.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import com.allme.back.global.exception.AppException;
import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.ProviderErrorCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 업체 등록 신청 — 개인회원(USER)이 제출하고 매니저/관리자가 승인·반려한다.
 * 승인 시 신청자에게 PROVIDER 역할이 부여된다(ProviderApplicationService.approve).
 * - 신청자는 user 도메인 관례대로 JPA 연관 없이 userId(Long)로만 참조한다(DB FK 없음).
 * - 반려 이력은 행으로 보존하고 재신청은 새 행으로 만든다 — 그래서 유니크 제약이 없고,
 *   "PENDING 중복 1건 방지"는 서비스의 existsByUserIdAndStatus 가드가 담당한다
 *   (partial unique index는 ddl-auto: update 체제에서 표현 불가).
 * - contactPhone은 고객 노출 전제의 업무 연락처라 평문 저장(본인인증 개인정보인 users.phone_number와 성격이 다름).
 * - 상태 전이(PENDING → APPROVED/REJECTED)는 엔티티 메서드가 불변식으로 보장한다.
 */
@Entity
@Table(
    name = "provider_applications",
    indexes = {
        @Index(name = "idx_provider_applications_status_id", columnList = "status, id"),
        @Index(name = "idx_provider_applications_user_id", columnList = "user_id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProviderApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "business_name", nullable = false, length = 100)
    private String businessName;

    /** 하이픈 제거·숫자 10자리로 정규화해 저장. 진위확인 API 연동은 MVP 이후. */
    @Column(name = "business_registration_number", nullable = false, length = 10)
    private String businessRegistrationNumber;

    @Column(nullable = false, length = 1000)
    private String introduction;

    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    /** 승인/반려를 처리한 매니저·관리자 user id */
    @Column(name = "processed_by_user_id")
    private Long processedByUserId;

    /** 심사 처리 시각 — lastModifiedDate와 달리 승인/반려 순간만 기록한다 */
    @Column(name = "processed_date")
    private LocalDateTime processedDate;

    private ProviderApplication(
        Long userId, String businessName, String businessRegistrationNumber,
        String introduction, String contactPhone
    ) {
        this.userId = userId;
        this.businessName = businessName;
        this.businessRegistrationNumber = businessRegistrationNumber;
        this.introduction = introduction;
        this.contactPhone = contactPhone;
        this.status = ApplicationStatus.PENDING;
    }

    public static ProviderApplication create(
        Long userId, String businessName, String businessRegistrationNumber,
        String introduction, String contactPhone
    ) {
        return new ProviderApplication(
            userId, businessName, businessRegistrationNumber, introduction, contactPhone);
    }

    public void approve(Long adminUserId) {
        requirePending();
        this.status = ApplicationStatus.APPROVED;
        markProcessed(adminUserId);
    }

    public void reject(Long adminUserId, String reason) {
        requirePending();
        this.status = ApplicationStatus.REJECTED;
        this.rejectReason = reason;
        markProcessed(adminUserId);
    }

    private void requirePending() {
        if (this.status != ApplicationStatus.PENDING) {
            throw new AppException(ProviderErrorCode.APPLICATION_ALREADY_PROCESSED);
        }
    }

    private void markProcessed(Long adminUserId) {
        this.processedByUserId = adminUserId;
        this.processedDate = LocalDateTime.now(KST_CLOCK);
    }

}
