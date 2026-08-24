package com.allme.back.user.infrastructure.portone;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.BankAccountHolderPort;
import com.allme.back.user.domain.Bank;
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
 * 포트원 V2 예금주 조회 어댑터 (파트너 정산/플랫폼 API).
 * GET {base-url}/platform/bank-accounts/{bank}/{accountNumber}/holder + "Authorization: PortOne {API_SECRET}"
 * 경로의 bank는 포트원 Bank enum name(Bank.portoneName)을 쓴다.
 * 주의: 이 API는 포트원 콘솔에서 파트너 정산(플랫폼) 기능이 활성화되어야 동작하며,
 * 미활성 시 PLATFORM_NOT_ENABLED로 응답한다(→ U019, 본인인증 U004 방침과 동일하게 저장 차단).
 * 로그에 계좌번호를 남기지 않는다(bank·type·원인만).
 */
@Slf4j
@Component
public class PortOneBankAccountHolderAdapter implements BankAccountHolderPort {

    private final RestClient restClient;
    private final String apiSecret;

    public PortOneBankAccountHolderAdapter(
        RestClient.Builder restClientBuilder,
        @Value("${portone.base-url}") String baseUrl,
        @Value("${portone.api-secret}") String apiSecret
    ) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.apiSecret = apiSecret;
    }

    @Override
    public String getHolderName(Bank bank, String accountNumber) {

        if (apiSecret == null || apiSecret.isBlank()) {
            throw new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_NOT_CONFIGURED);
        }

        HolderResponse response;
        try {
            response = restClient.get()
                .uri("/platform/bank-accounts/{bank}/{accountNumber}/holder",
                    bank.getPortoneName(), accountNumber)
                .header(HttpHeaders.AUTHORIZATION, "PortOne " + apiSecret)
                .retrieve()
                .body(HolderResponse.class);
        } catch (HttpClientErrorException e) {
            throw toAppException(bank, e);
        } catch (RestClientException e) {
            log.warn("[PortOne] 예금주 조회 실패: bank={}, cause={}", bank, e.getMessage());
            throw new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_PROVIDER_ERROR);
        }

        if (response == null || response.holderName() == null || response.holderName().isBlank()) {
            throw new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_PROVIDER_ERROR);
        }
        return response.holderName();
    }

    /** 4xx 에러 body의 type으로 분기 — 계좌 확인 불가(U017)와 기능 미활성(U019)을 구분한다 */
    private AppException toAppException(Bank bank, HttpClientErrorException e) {
        String type = null;
        try {
            ErrorBody body = e.getResponseBodyAs(ErrorBody.class);
            type = body != null ? body.type() : null;
        } catch (RuntimeException ignored) {
            // body가 JSON이 아니어도 아래 기본 매핑으로 처리
        }
        log.warn("[PortOne] 예금주 조회 거절: bank={}, status={}, type={}", bank, e.getStatusCode(), type);
        return switch (type == null ? "" : type) {
            // 계좌번호 오류·미지원 은행·은행 실명조회 실패 — 사용자가 입력을 고치면 되는 경우
            case "INVALID_REQUEST", "PLATFORM_NOT_SUPPORTED_BANK", "PLATFORM_EXTERNAL_API_FAILED" ->
                new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_FAILED);
            case "PLATFORM_NOT_ENABLED" ->
                new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_NOT_CONFIGURED);
            default ->
                new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_PROVIDER_ERROR);
        };
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record HolderResponse(String holderName) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ErrorBody(String type) {}

}
