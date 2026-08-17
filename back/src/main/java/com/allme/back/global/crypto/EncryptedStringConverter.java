package com.allme.back.global.crypto;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 개인정보 컬럼용 JPA 컨버터 — 엔티티 필드는 평문, DB 컬럼은 AES-GCM 암호문.
 * 적용: 필드에 {@code @Convert(converter = EncryptedStringConverter.class)}.
 * 스프링 부트가 Hibernate에 SpringBeanContainer를 연결해 주므로 @Component 주입이 동작한다.
 * autoApply를 쓰지 않는 이유: String 전체가 아니라 지정한 민감 컬럼에만 적용하기 위함.
 */
@Converter
@Component
@RequiredArgsConstructor
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private final AesGcmStringEncryptor encryptor;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryptor.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryptor.decrypt(dbData);
    }

}
