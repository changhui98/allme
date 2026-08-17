package com.allme.back.global.crypto;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 개인정보 필드(이름·CI·DI·휴대폰번호) 양방향 암호화기. AES-256-GCM.
 * 매 호출마다 랜덤 IV를 쓰므로 같은 평문도 암호문이 달라진다(비결정적) —
 * 같은 값 조회가 필요한 컬럼은 이걸로 검색할 수 없고 HMAC 해시 컬럼을 별도로 둔다.
 * 저장 포맷: base64(IV 12바이트 ∥ 암호문+GCM 태그)
 */
@Component
public class AesGcmStringEncryptor {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final SecretKey key;
    private final SecureRandom random = new SecureRandom();

    public AesGcmStringEncryptor(@Value("${crypto.enc-key}") String base64Key) {
        byte[] raw = Base64.getDecoder().decode(base64Key);
        if (raw.length != 32) {
            throw new IllegalStateException("crypto.enc-key는 base64 인코딩된 32바이트(AES-256) 키여야 합니다.");
        }
        this.key = new SecretKeySpec(raw, "AES");
    }

    public String encrypt(String plainText) {
        if (plainText == null) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            byte[] combined = ByteBuffer.allocate(iv.length + cipherText.length)
                .put(iv)
                .put(cipherText)
                .array();
            return Base64.getEncoder().encodeToString(combined);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("필드 암호화에 실패했습니다.", e);
        }
    }

    public String decrypt(String encoded) {
        if (encoded == null) {
            return null;
        }
        try {
            byte[] combined = Base64.getDecoder().decode(encoded);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key,
                new GCMParameterSpec(TAG_LENGTH_BITS, combined, 0, IV_LENGTH_BYTES));
            byte[] plain = cipher.doFinal(combined, IV_LENGTH_BYTES, combined.length - IV_LENGTH_BYTES);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            // 키가 바뀌었거나 암호문이 손상된 경우 — 데이터 문제라 복구 불가
            throw new IllegalStateException("필드 복호화에 실패했습니다.", e);
        }
    }

}
