package com.allme.back.global.crypto;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 검색용 일방향 해시기. HMAC-SHA256 → base64(44자).
 * AES-GCM 암호문은 비결정적이라 equal 조회가 불가능하므로,
 * CI 중복가입 체크처럼 "같은 값인지"만 확인하면 되는 컬럼에 이 해시를 저장한다.
 * 단순 SHA-256이 아닌 HMAC인 이유: 키 없이는 레인보우 테이블式 역추적이 불가능하다.
 */
@Component
public class HmacSha256Hasher {

    private static final String ALGORITHM = "HmacSHA256";

    private final SecretKeySpec key;

    public HmacSha256Hasher(@Value("${crypto.hmac-key}") String base64Key) {
        byte[] raw = Base64.getDecoder().decode(base64Key);
        if (raw.length != 32) {
            throw new IllegalStateException("crypto.hmac-key는 base64 인코딩된 32바이트 키여야 합니다.");
        }
        this.key = new SecretKeySpec(raw, ALGORITHM);
    }

    public String hash(String value) {
        if (value == null) {
            return null;
        }
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(key);
            return Base64.getEncoder().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("해시 생성에 실패했습니다.", e);
        }
    }

}
