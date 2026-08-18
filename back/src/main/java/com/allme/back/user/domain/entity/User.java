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
 * - password·name·ci·ciHash가 DB nullable인 이유: 탈퇴 행은 개인정보를 아카이브 DB로
 *   이관한 뒤 null로 비우기 때문(withdraw 참조). 활성 회원의 not null은 가입 로직이 보장한다.
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

    @Column(length = 60)
    private String password;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(length = 512)
    private String name;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(length = 512)
    private String ci;

    @Column(name = "ci_hash", unique = true, length = 44)
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

    /**
     * 프로필 이미지 파일 id — file 도메인 upload_files 테이블 참조.
     * 도메인 간 결합을 피하려고 JPA 연관 없이 id만 보관한다(DB FK 제약도 없음). 미설정이면 null.
     */
    @Column(name = "profile_image_file_id")
    private Long profileImageFileId;

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

    public void changeProfileImageFile(Long profileImageFileId) {
        this.profileImageFileId = profileImageFileId;
    }

    /**
     * 회원탈퇴 — soft delete 마킹 후 개인정보를 전부 비운다.
     * 본 DB에는 id·loginId·삭제일만 유의미하게 남는다(아이디 재사용 차단 유지).
     * 반드시 아카이브 DB 이관이 성공한 뒤에 호출할 것(UserService.withdraw 순서 보장).
     * ciHash가 null이 되므로 같은 CI로 재가입할 수 있다(unique는 null 중복 허용).
     */
    public void withdraw() {
        delete();
        this.password = null;
        this.name = null;
        this.ci = null;
        this.ciHash = null;
        this.di = null;
        this.phoneNumber = null;
        this.profileImageFileId = null;
    }

    /** encodedPassword는 반드시 BCrypt 해시를 넘긴다 (원문 전달 금지). */
    public static User create(
        String loginId, String encodedPassword, String name,
        String ci, String ciHash, String di, String phoneNumber, boolean marketingConsent
    ) {
        return new User(loginId, encodedPassword, name, ci, ciHash, di, phoneNumber, marketingConsent);
    }

}
