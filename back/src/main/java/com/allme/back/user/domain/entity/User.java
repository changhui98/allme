package com.allme.back.user.domain.entity;

import com.allme.back.global.crypto.EncryptedStringConverter;
import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 엔티티.
 * - 개인정보(name·ci·di·phoneNumber)는 AES-GCM 암호화 컬럼 — 필드는 평문, DB에는 암호문(길이 512).
 * - ciHash는 CI 중복가입 체크용 HMAC-SHA256(44자) — 암호문은 비결정적이라 검색 불가하기 때문.
 * - password는 BCrypt 해시(60자 고정)만 저장하고 원문은 어디에도 남기지 않는다.
 * 테이블명이 users인 이유: user는 PostgreSQL 예약어라 그대로 쓸 수 없다.
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", nullable = false, unique = true, length = 20)
    private String loginId;

    @Column(nullable = false, length = 60)
    private String password;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, length = 512)
    private String name;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, length = 512)
    private String ci;

    @Column(name = "ci_hash", nullable = false, unique = true, length = 44)
    private String ciHash;

    /** 인증 수단에 따라 미제공일 수 있어 nullable */
    @Convert(converter = EncryptedStringConverter.class)
    @Column(length = 512)
    private String di;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "phone_number", length = 512)
    private String phoneNumber;

    @Column(name = "marketing_consent", nullable = false)
    private boolean marketingConsent;

    private User(
        String loginId, String encodedPassword, String name,
        String ci, String ciHash, String di, String phoneNumber, boolean marketingConsent
    ) {
        this.loginId = loginId;
        this.password = encodedPassword;
        this.name = name;
        this.ci = ci;
        this.ciHash = ciHash;
        this.di = di;
        this.phoneNumber = phoneNumber;
        this.marketingConsent = marketingConsent;
    }

    /** encodedPassword는 반드시 BCrypt 해시를 넘긴다 (원문 전달 금지). */
    public static User create(
        String loginId, String encodedPassword, String name,
        String ci, String ciHash, String di, String phoneNumber, boolean marketingConsent
    ) {
        return new User(loginId, encodedPassword, name, ci, ciHash, di, phoneNumber, marketingConsent);
    }

}
