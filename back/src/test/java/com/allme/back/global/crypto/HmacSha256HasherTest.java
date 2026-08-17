package com.allme.back.global.crypto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Base64;
import org.junit.jupiter.api.Test;

class HmacSha256HasherTest {

    /** 테스트 전용 고정 키 (32바이트) */
    private static final String TEST_KEY =
        Base64.getEncoder().encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    private final HmacSha256Hasher hasher = new HmacSha256Hasher(TEST_KEY);

    @Test
    void 같은_값은_항상_같은_해시가_나온다() {
        // CI 중복가입 체크가 성립하려면 결정적이어야 한다
        assertEquals(hasher.hash("ci-value"), hasher.hash("ci-value"));
    }

    @Test
    void 다른_값은_다른_해시가_나온다() {
        assertNotEquals(hasher.hash("ci-value-1"), hasher.hash("ci-value-2"));
    }

    @Test
    void 해시는_base64_44자다() {
        // users.ci_hash 컬럼 길이(44)와의 계약
        assertEquals(44, hasher.hash("any-value").length());
    }

    @Test
    void null은_null로_통과시킨다() {
        assertNull(hasher.hash(null));
    }

}
