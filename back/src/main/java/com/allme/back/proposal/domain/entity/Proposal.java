package com.allme.back.proposal.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import com.allme.back.global.exception.AppException;
import com.allme.back.proposal.domain.ProposalErrorCode;
import com.allme.back.proposal.domain.ProposalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 업체 제안("해드릴게요") — 업체(PROVIDER)가 서비스 요청에 금액·메시지로 제안한다.
 * - 요청·업체는 JPA 연관 없이 id(Long)로만 참조한다(DB FK 없음, 프로젝트 관례).
 * - 업체당 요청 1건에 제안 1개 — 새 테이블이라 unique 제약을 ddl-auto가 만들며, 서비스도 중복을 먼저 검사한다(B004).
 * - 상태 전이는 PENDING → ACCEPTED | REJECTED 한 번뿐(B005). 금액은 원 단위.
 */
@Entity
@Table(
    name = "proposals",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_proposals_request_id_provider_user_id", columnNames = {"request_id", "provider_user_id"}),
    indexes = {
        @Index(name = "idx_proposals_request_id_id", columnList = "request_id, id"),
        @Index(name = "idx_proposals_provider_user_id_id", columnList = "provider_user_id, id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Proposal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "provider_user_id", nullable = false)
    private Long providerUserId;

    /** 제안 금액(원) */
    @Column(nullable = false)
    private long amount;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProposalStatus status;

    /** 수락·거절 시각 */
    @Column(name = "decided_date")
    private LocalDateTime decidedDate;

    private Proposal(Long requestId, Long providerUserId, long amount, String message) {
        this.requestId = requestId;
        this.providerUserId = providerUserId;
        this.amount = amount;
        this.message = message;
        this.status = ProposalStatus.PENDING;
    }

    public static Proposal create(Long requestId, Long providerUserId, long amount, String message) {
        return new Proposal(requestId, providerUserId, amount, message);
    }

    public void accept() {
        requirePending();
        this.status = ProposalStatus.ACCEPTED;
        this.decidedDate = LocalDateTime.now(KST_CLOCK);
    }

    public void reject() {
        requirePending();
        this.status = ProposalStatus.REJECTED;
        this.decidedDate = LocalDateTime.now(KST_CLOCK);
    }

    public boolean isPending() {
        return this.status == ProposalStatus.PENDING;
    }

    private void requirePending() {
        if (!isPending()) {
            throw new AppException(ProposalErrorCode.ALREADY_DECIDED);
        }
    }

}
