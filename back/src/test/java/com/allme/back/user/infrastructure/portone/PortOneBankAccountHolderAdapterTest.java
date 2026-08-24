package com.allme.back.user.infrastructure.portone;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.domain.Bank;
import com.allme.back.user.domain.UserErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class PortOneBankAccountHolderAdapterTest {

    private static final String BASE_URL = "https://api.portone.example";

    private MockRestServiceServer server;
    private PortOneBankAccountHolderAdapter adapter;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        adapter = new PortOneBankAccountHolderAdapter(builder, BASE_URL, "test-secret");
    }

    @Test
    @DisplayName("예금주를 반환한다 — 경로에는 포트원 Bank enum name(portoneName)을 쓴다")
    void getHolderName_success() {
        server.expect(requestTo(BASE_URL + "/platform/bank-accounts/KOOKMIN/11012345678/holder"))
            .andExpect(method(HttpMethod.GET))
            .andExpect(header("Authorization", "PortOne test-secret"))
            .andRespond(withSuccess("""
                {"holderName": "홍길동", "accountVerificationId": "av-1"}
                """, MediaType.APPLICATION_JSON));

        assertThat(adapter.getHolderName(Bank.KB, "11012345678")).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("계좌 오류 계열 type(INVALID_REQUEST 등)이면 VERIFICATION_FAILED 예외를 던진다")
    void getHolderName_invalidAccount() {
        server.expect(requestTo(BASE_URL + "/platform/bank-accounts/TOSS/99912345678/holder"))
            .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"type\":\"PLATFORM_EXTERNAL_API_FAILED\",\"message\":\"...\"}"));

        assertThatThrownBy(() -> adapter.getHolderName(Bank.TOSS, "99912345678"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_FAILED);
    }

    @Test
    @DisplayName("플랫폼 기능 미활성(PLATFORM_NOT_ENABLED)이면 NOT_CONFIGURED 예외를 던진다")
    void getHolderName_platformNotEnabled() {
        server.expect(requestTo(BASE_URL + "/platform/bank-accounts/KOOKMIN/11012345678/holder"))
            .andRespond(withStatus(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"type\":\"PLATFORM_NOT_ENABLED\"}"));

        assertThatThrownBy(() -> adapter.getHolderName(Bank.KB, "11012345678"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_NOT_CONFIGURED);
    }

    @Test
    @DisplayName("4xx인데 body를 해석할 수 없으면 PROVIDER_ERROR 예외를 던진다")
    void getHolderName_unparsableClientError() {
        server.expect(requestTo(BASE_URL + "/platform/bank-accounts/KOOKMIN/11012345678/holder"))
            .andRespond(withStatus(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.TEXT_PLAIN)
                .body("unauthorized"));

        assertThatThrownBy(() -> adapter.getHolderName(Bank.KB, "11012345678"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_PROVIDER_ERROR);
    }

    @Test
    @DisplayName("5xx 등 그 외 오류면 PROVIDER_ERROR 예외를 던진다")
    void getHolderName_serverError() {
        server.expect(requestTo(BASE_URL + "/platform/bank-accounts/KOOKMIN/11012345678/holder"))
            .andRespond(withServerError());

        assertThatThrownBy(() -> adapter.getHolderName(Bank.KB, "11012345678"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_PROVIDER_ERROR);
    }

    @Test
    @DisplayName("API Secret 미설정이면 호출 없이 NOT_CONFIGURED 예외를 던진다")
    void getHolderName_notConfigured() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer unused = MockRestServiceServer.bindTo(builder).build();
        PortOneBankAccountHolderAdapter notConfigured =
            new PortOneBankAccountHolderAdapter(builder, BASE_URL, "");

        assertThatThrownBy(() -> notConfigured.getHolderName(Bank.KB, "11012345678"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.SETTLEMENT_ACCOUNT_VERIFICATION_NOT_CONFIGURED);

        unused.verify();
    }

}
