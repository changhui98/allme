package com.allme.back.user.infrastructure.portone;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort;
import com.allme.back.user.domain.UserErrorCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * 포트원 V2 본인인증 단건 조회 어댑터.
 * GET {base-url}/identity-verifications/{id} + "Authorization: PortOne {API_SECRET}"
 * 주의: KG이니시스 통합인증은 verifiedCustomer.di를 내려주지 않는다(포트원 헬프센터 공식).
 * users.di가 null인 것은 정상이며, DI를 주는 인증 수단(다날 SMS 등) 추가 시 채워진다.
 */
@Slf4j
@Component
public class PortOneIdentityVerificationAdapter implements IdentityVerificationPort {

    private final RestClient restClient;
    private final String apiSecret;

    public PortOneIdentityVerificationAdapter(
        RestClient.Builder restClientBuilder,
        @Value("${portone.base-url}") String baseUrl,
        @Value("${portone.api-secret}") String apiSecret
    ) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.apiSecret = apiSecret;
    }

    @Override
    public IdentityVerificationResult get(String identityVerificationId) {

        if (apiSecret == null || apiSecret.isBlank()) {
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_NOT_CONFIGURED);
        }

        PortOneResponse response;
        try {
            response = restClient.get()
                .uri("/identity-verifications/{id}", identityVerificationId)
                .header(HttpHeaders.AUTHORIZATION, "PortOne " + apiSecret)
                .retrieve()
                .body(PortOneResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_NOT_FOUND);
        } catch (RestClientException e) {
            log.warn("[PortOne] 본인인증 조회 실패: id={}, cause={}", identityVerificationId, e.getMessage());
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_PROVIDER_ERROR);
        }

        if (response == null) {
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_PROVIDER_ERROR);
        }

        VerifiedCustomer customer = response.verifiedCustomer() != null
            ? response.verifiedCustomer()
            : new VerifiedCustomer(null, null, null, null, null, null);

        return new IdentityVerificationResult(
            response.status(),
            customer.name(),
            customer.birthDate(),
            customer.phoneNumber(),
            customer.gender(),
            customer.ci(),
            customer.di()
        );
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record PortOneResponse(String status, VerifiedCustomer verifiedCustomer) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record VerifiedCustomer(
        String name, String birthDate, String phoneNumber, String gender, String ci, String di
    ) {}

}
