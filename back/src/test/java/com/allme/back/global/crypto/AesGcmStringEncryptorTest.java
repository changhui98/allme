package com.allme.back.global.crypto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Base64;
import org.junit.jupiter.api.Test;

class AesGcmStringEncryptorTest {

    /** 테스트 전용 고정 키 (32바이트) */
    private static final String TEST_KEY =
        Base64.getEncoder().encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    private final AesGcmStringEncryptor encryptor = new AesGcmStringEncryptor(TEST_KEY);

    @Test
    void 암호화한_값을_복호화하면_원문이_나온다() {
        String plain = "홍길동 CI값-테스트/+=";

        String encrypted = encryptor.encrypt(plain);

        assertNotEquals(plain, encrypted);
        assertEquals(plain, encryptor.decrypt(encrypted));
    }

    @Test
    void 같은_평문도_호출마다_다른_암호문이_나온다() {
        String plain = "same-plain-text";

        assertNotEquals(encryptor.encrypt(plain), encryptor.encrypt(plain));
    }

    @Test
    void null은_null로_통과시킨다() {
        assertNull(encryptor.encrypt(null));
        assertNull(encryptor.decrypt(null));
    }

    @Test
    void 다른_키로는_복호화할_수_없다() {
        String otherKey =
            Base64.getEncoder().encodeToString("fedcba9876543210fedcba9876543210".getBytes());
        String encrypted = encryptor.encrypt("secret");

        assertThrows(IllegalStateException.class,
            () -> new AesGcmStringEncryptor(otherKey).decrypt(encrypted));
    }

    @Test
    void 키가_32바이트가_아니면_생성_시_실패한다() {
        String shortKey = Base64.getEncoder().encodeToString("short".getBytes());

        assertThrows(IllegalStateException.class, () -> new AesGcmStringEncryptor(shortKey));
    }

}
