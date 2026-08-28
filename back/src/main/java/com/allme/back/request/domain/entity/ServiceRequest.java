package com.allme.back.request.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import com.allme.back.global.exception.AppException;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.ServiceRequestErrorCode;
import com.allme.back.request.domain.ServiceRequestStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 서비스 요청("해주세요" 글) — 개인회원이 원하는 작업을 올리고 업체의 제안을 받는 거래 루프의 첫 단계.
 * - 작성자는 user 도메인 관례대로 JPA 연관 없이 userId(Long)로만 참조한다(DB FK 없음).
 * - 예산(원)·희망일·작업 규모는 시세 데이터 적재를 위해 자유 문자열이 아니라 숫자·날짜로 정규화해 저장한다
 *   (CLAUDE.md "시세 데이터를 첫날부터 적재"). 단위는 카테고리가 결정한다(ServiceCategory.unitType).
 * - 상세 주소는 개인정보라 본인 상세 응답에만 내리고 목록·공개 API에는 노출하지 않는다.
 * - 정합성 규칙(R002~R004)은 ddl-auto: update가 CHECK 제약을 관리하지 못하므로 정적 팩토리에서 강제한다.
 * - 업체 제안(proposal 도메인)은 이 요청을 id로 참조한다. 제안 수는 목록 표시용으로 여기에 비정규화해 두고
 *   (제안 등록 트랜잭션에서 +1), 수락 시 OPEN → CLOSED로 마감되며 수락된 제안 id를 기록한다.
 */
@Entity
@Table(
    name = "service_requests",
    indexes = {
        @Index(name = "idx_service_requests_user_id_id", columnList = "user_id, id"),
        @Index(name = "idx_service_requests_category_region_id", columnList = "category, region, id"),
        @Index(name = "idx_service_requests_status_category_id", columnList = "status, category, id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceCategory category;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Region region;

    /** 현장 방문형 카테고리에서만 — 매칭 후 업체에게만 공개할 상세 주소 */
    @Column(name = "address_detail", length = 200)
    private String addressDetail;

    /** 희망 작업일 — scheduleNegotiable이면 null 허용 */
    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Column(name = "schedule_negotiable", nullable = false)
    private boolean scheduleNegotiable;

    /** 희망 예산 하한·상한(원) — budgetNegotiable이면 null 허용 */
    @Column(name = "budget_min")
    private Long budgetMin;

    @Column(name = "budget_max")
    private Long budgetMax;

    @Column(name = "budget_negotiable", nullable = false)
    private boolean budgetNegotiable;

    /** 작업 규모 값(평수·페이지 수) — 단위는 category.unitType. 선택 입력 */
    @Column(name = "unit_value")
    private Integer unitValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceRequestStatus status;

    /** 받은 제안 수 — 목록 표시용 비정규화. 기존 행이 있는 테이블이라 DB 기본값 필수(ddl-auto: update) */
    @Column(name = "proposal_count", nullable = false, columnDefinition = "bigint not null default 0")
    private long proposalCount;

    /** 수락한 제안 id(proposals.id) — 마감(CLOSED) 시 기록 */
    @Column(name = "accepted_proposal_id")
    private Long acceptedProposalId;

    private ServiceRequest(
        Long userId, ServiceCategory category, String title, String content,
        Region region, String addressDetail,
        LocalDate preferredDate, boolean scheduleNegotiable,
        Long budgetMin, Long budgetMax, boolean budgetNegotiable,
        Integer unitValue
    ) {
        this.userId = userId;
        this.category = category;
        this.title = title;
        this.content = content;
        this.region = region;
        this.addressDetail = addressDetail;
        this.preferredDate = preferredDate;
        this.scheduleNegotiable = scheduleNegotiable;
        this.budgetMin = budgetMin;
        this.budgetMax = budgetMax;
        this.budgetNegotiable = budgetNegotiable;
        this.unitValue = unitValue;
        this.status = ServiceRequestStatus.OPEN;
    }

    /**
     * 요청 생성 — 정합성 규칙을 여기서 강제한다.
     * - 일정: 협의 가능이 아니면 희망일 필수 (R002)
     * - 예산: 제안 받기가 아니면 최소·최대 모두 있고 0 < 최소 <= 최대 (R003)
     * - 지역: 현장형 카테고리는 ONLINE 불가, 비현장형은 상세 주소 불가 (R004). 공백 주소는 null로 정규화.
     */
    public static ServiceRequest create(
        Long userId, ServiceCategory category, String title, String content,
        Region region, String addressDetail,
        LocalDate preferredDate, boolean scheduleNegotiable,
        Long budgetMin, Long budgetMax, boolean budgetNegotiable,
        Integer unitValue
    ) {
        String normalizedAddress = normalizeBlank(addressDetail);

        if (!scheduleNegotiable && preferredDate == null) {
            throw new AppException(ServiceRequestErrorCode.INVALID_SCHEDULE);
        }
        if (!budgetNegotiable && !isValidBudgetRange(budgetMin, budgetMax)) {
            throw new AppException(ServiceRequestErrorCode.INVALID_BUDGET);
        }
        if (category.isRequiresSite() ? region == Region.ONLINE : normalizedAddress != null) {
            throw new AppException(ServiceRequestErrorCode.INVALID_REGION);
        }

        return new ServiceRequest(
            userId, category, title, content, region, normalizedAddress,
            scheduleNegotiable ? null : preferredDate, scheduleNegotiable,
            budgetNegotiable ? null : budgetMin, budgetNegotiable ? null : budgetMax, budgetNegotiable,
            unitValue
        );
    }

    /** 제안 등록 시 +1 (제안 트랜잭션 안에서 호출) */
    public void increaseProposalCount() {
        this.proposalCount++;
    }

    /** 제안 수락 — 모집 중인 요청만(R007). 상태를 CLOSED로 바꾸고 수락 제안 id를 기록한다. */
    public void accept(Long proposalId) {
        requireOpen();
        this.status = ServiceRequestStatus.CLOSED;
        this.acceptedProposalId = proposalId;
    }

    public boolean isOpen() {
        return this.status == ServiceRequestStatus.OPEN;
    }

    private void requireOpen() {
        if (!isOpen()) {
            throw new AppException(ServiceRequestErrorCode.REQUEST_NOT_OPEN);
        }
    }

    private static boolean isValidBudgetRange(Long min, Long max) {
        return min != null && max != null && min > 0 && min <= max;
    }

    private static String normalizeBlank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

}
