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
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.domain.UserErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class PortOneIdentityVerificationAdapterTest {

    private static final String BASE_URL = "https://api.portone.example";

    private MockRestServiceServer server;
    private PortOneIdentityVerificationAdapter adapter;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        adapter = new PortOneIdentityVerificationAdapter(builder, BASE_URL, "test-secret");
    }

    @Test
    @DisplayName("VERIFIED 응답을 결과로 매핑한다 (모르는 필드는 무시)")
    void get_verified() {
        server.expect(requestTo(BASE_URL + "/identity-verifications/iv-1"))
            .andExpect(method(HttpMethod.GET))
            .andExpect(header("Authorization", "PortOne test-secret"))
            .andRespond(withSuccess("""
                {
                  "status": "VERIFIED",
                  "requestedAt": "2026-08-11T00:00:00Z",
                  "verifiedCustomer": {
                    "id": "cust-1",
                    "name": "홍길동",
                    "birthDate": "1998-01-02",
                    "phoneNumber": "01012345678",
                    "gender": "MALE",
                    "ci": "ci-value",
                    "operator": "SKT"
                  }
                }
                """, MediaType.APPLICATION_JSON));

        IdentityVerificationResult result = adapter.get("iv-1");

        assertThat(result.isVerified()).isTrue();
        assertThat(result.name()).isEqualTo("홍길동");
        assertThat(result.birthDate()).isEqualTo("1998-01-02");
        assertThat(result.phoneNumber()).isEqualTo("01012345678");
        assertThat(result.gender()).isEqualTo("MALE");
        assertThat(result.ci()).isEqualTo("ci-value");
    }

    @Test
    @DisplayName("아직 인증 전(READY)이면 verifiedCustomer 없이도 상태를 반환한다")
    void get_ready_withoutCustomer() {
        server.expect(requestTo(BASE_URL + "/identity-verifications/iv-1"))
            .andRespond(withSuccess("{\"status\": \"READY\"}", MediaType.APPLICATION_JSON));

        IdentityVerificationResult result = adapter.get("iv-1");

        assertThat(result.isVerified()).isFalse();
        assertThat(result.name()).isNull();
    }

    @Test
    @DisplayName("404면 NOT_FOUND 예외를 던진다")
    void get_notFound() {
        server.expect(requestTo(BASE_URL + "/identity-verifications/iv-x"))
            .andRespond(withStatus(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"type\":\"IDENTITY_VERIFICATION_NOT_FOUND\"}"));

        assertThatThrownBy(() -> adapter.get("iv-x"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_NOT_FOUND);
    }

    @Test
    @DisplayName("5xx 등 그 외 오류면 PROVIDER_ERROR 예외를 던진다")
    void get_serverError() {
        server.expect(requestTo(BASE_URL + "/identity-verifications/iv-1"))
            .andRespond(withServerError());

        assertThatThrownBy(() -> adapter.get("iv-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_PROVIDER_ERROR);
    }

    @Test
    @DisplayName("API Secret 미설정이면 호출 없이 NOT_CONFIGURED 예외를 던진다")
    void get_notConfigured() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer unused = MockRestServiceServer.bindTo(builder).build();
        PortOneIdentityVerificationAdapter notConfigured =
            new PortOneIdentityVerificationAdapter(builder, BASE_URL, "");

        assertThatThrownBy(() -> notConfigured.get("iv-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_NOT_CONFIGURED);

        unused.verify();
    }

}
