package com.allme.back.request.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.ServiceRequestErrorCode;
import com.allme.back.request.domain.ServiceRequestStatus;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ServiceRequestTest {

    private static final LocalDate DATE = LocalDate.of(2026, 9, 1);

    @Test
    @DisplayName("현장형 카테고리 요청은 구 지역·상세 주소·희망일·예산 범위로 OPEN 상태로 생성된다")
    void create_siteCategory() {
        ServiceRequest request = ServiceRequest.create(
            1L, ServiceCategory.CLEANING, "제목", "내용", Region.GWANAK, "  101동 202호 ",
            DATE, false, 150_000L, 200_000L, false, 24);

        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.OPEN);
        assertThat(request.getAddressDetail()).isEqualTo("101동 202호");
        assertThat(request.getPreferredDate()).isEqualTo(DATE);
        assertThat(request.getBudgetMin()).isEqualTo(150_000L);
        assertThat(request.getBudgetMax()).isEqualTo(200_000L);
        assertThat(request.getUnitValue()).isEqualTo(24);
    }

    @Test
    @DisplayName("비현장형 카테고리는 ONLINE 지역을 허용하고, 협의·제안 선택 시 날짜·예산은 null로 정규화된다")
    void create_onlineCategory_negotiable() {
        ServiceRequest request = ServiceRequest.create(
            1L, ServiceCategory.WEB_DESIGN, "제목", "내용", Region.ONLINE, null,
            DATE, true, 100L, 200L, true, null);

        assertThat(request.getRegion()).isEqualTo(Region.ONLINE);
        assertThat(request.getPreferredDate()).isNull();
        assertThat(request.isScheduleNegotiable()).isTrue();
        assertThat(request.getBudgetMin()).isNull();
        assertThat(request.getBudgetMax()).isNull();
        assertThat(request.isBudgetNegotiable()).isTrue();
    }

    @Test
    @DisplayName("협의 가능이 아닌데 희망일이 없으면 R002")
    void create_missingDate() {
        assertThatThrownBy(() -> ServiceRequest.create(
            1L, ServiceCategory.CLEANING, "제목", "내용", Region.GWANAK, null,
            null, false, 100L, 200L, false, null))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.INVALID_SCHEDULE);
    }

    @Test
    @DisplayName("제안 받기가 아닌데 예산이 비거나 0이거나 최소가 최대보다 크면 R003")
    void create_invalidBudget() {
        assertBudgetInvalid(null, 200L);
        assertBudgetInvalid(100L, null);
        assertBudgetInvalid(0L, 200L);
        assertBudgetInvalid(300L, 200L);
    }

    private static void assertBudgetInvalid(Long min, Long max) {
        assertThatThrownBy(() -> ServiceRequest.create(
            1L, ServiceCategory.CLEANING, "제목", "내용", Region.GWANAK, null,
            DATE, false, min, max, false, null))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.INVALID_BUDGET);
    }

    @Test
    @DisplayName("현장형 카테고리에 ONLINE 지역은 R004")
    void create_siteCategory_online() {
        assertThatThrownBy(() -> ServiceRequest.create(
            1L, ServiceCategory.PAINTING, "제목", "내용", Region.ONLINE, null,
            DATE, false, 100L, 200L, false, null))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.INVALID_REGION);
    }

    @Test
    @DisplayName("비현장형 카테고리에 상세 주소가 있으면 R004, 공백 주소는 없는 것으로 본다")
    void create_onlineCategory_address() {
        assertThatThrownBy(() -> ServiceRequest.create(
            1L, ServiceCategory.WEB_DESIGN, "제목", "내용", Region.MAPO, "상세 주소",
            DATE, false, 100L, 200L, false, null))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.INVALID_REGION);

        ServiceRequest request = ServiceRequest.create(
            1L, ServiceCategory.WEB_DESIGN, "제목", "내용", Region.MAPO, "   ",
            DATE, false, 100L, 200L, false, null);
        assertThat(request.getAddressDetail()).isNull();
    }


    @Test
    @DisplayName("제안 수를 늘리고, 수락하면 CLOSED로 마감되며 재수락은 R007")
    void proposalCountAndAccept() {
        ServiceRequest request = ServiceRequest.create(
            1L, ServiceCategory.CLEANING, "제목", "내용", Region.GWANAK, null,
            DATE, false, 100L, 200L, false, null);

        request.increaseProposalCount();
        request.increaseProposalCount();
        assertThat(request.getProposalCount()).isEqualTo(2);
        assertThat(request.isOpen()).isTrue();

        request.accept(7L);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.CLOSED);
        assertThat(request.getAcceptedProposalId()).isEqualTo(7L);
        assertThat(request.isOpen()).isFalse();

        assertThatThrownBy(() -> request.accept(8L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.REQUEST_NOT_OPEN);
    }

}
