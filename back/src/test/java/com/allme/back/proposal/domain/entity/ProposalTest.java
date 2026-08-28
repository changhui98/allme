package com.allme.back.proposal.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.proposal.domain.ProposalErrorCode;
import com.allme.back.proposal.domain.ProposalStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ProposalTest {

    @Test
    @DisplayName("제안은 대기 상태로 생성되고 수락하면 처리 시각이 기록된다")
    void create_and_accept() {
        Proposal proposal = Proposal.create(10L, 2L, 500_000L, "잘 해드릴게요");

        assertThat(proposal.getStatus()).isEqualTo(ProposalStatus.PENDING);
        assertThat(proposal.isPending()).isTrue();
        assertThat(proposal.getDecidedDate()).isNull();

        proposal.accept();

        assertThat(proposal.getStatus()).isEqualTo(ProposalStatus.ACCEPTED);
        assertThat(proposal.getDecidedDate()).isNotNull();
    }

    @Test
    @DisplayName("이미 처리된 제안은 다시 수락·거절할 수 없다(B005)")
    void decidedTwice() {
        Proposal proposal = Proposal.create(10L, 2L, 500_000L, "m");
        proposal.reject();

        assertThat(proposal.getStatus()).isEqualTo(ProposalStatus.REJECTED);
        assertThatThrownBy(proposal::accept)
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProposalErrorCode.ALREADY_DECIDED);
        assertThatThrownBy(proposal::reject)
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProposalErrorCode.ALREADY_DECIDED);
    }

}
