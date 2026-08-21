package com.allme.back.user.domain.entity;

import com.allme.back.global.crypto.EncryptedStringConverter;
import com.allme.back.global.entity.BaseEntity;
import com.allme.back.user.domain.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;
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

    /**
     * 대외 표시명(랜덤 3단어 한글 닉네임, 예: "멀미하는 귀여운 고양이").
     * 표시·중복확인이 필요해 평문 unique — 암호화(비결정적)하면 둘 다 불가.
     * nullable인 이유: 탈퇴 시 null로 비워 unique를 반납한다(활성 회원은 가입 로직이 보장).
     */
    @Column(unique = true, length = 30)
    private String nickname;

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

    /** 마케팅 동의 변경 일시 — 동의 이력 고지 대비. 가입 시엔 가입일이 곧 동의일이라 null */
    @Column(name = "marketing_consent_updated_at")
    private LocalDateTime marketingConsentUpdatedAt;

    /**
     * 프로필 이미지 파일 id — file 도메인 upload_files 테이블 참조.
     * 도메인 간 결합을 피하려고 JPA 연관 없이 id만 보관한다(DB FK 제약도 없음). 미설정이면 null.
     */
    @Column(name = "profile_image_file_id")
    private Long profileImageFileId;

    /**
     * 보유 역할(다중) — grantRole/revokeRole로만 조작한다.
     * EAGER인 이유: open-in-view가 꺼져 있어 컨트롤러의 응답 조립(summaryOf)에서
     * LAZY 접근 시 LazyInitializationException이 난다. 계정당 최대 4행이고
     * 인증된 요청 대부분(로그인·me)에서 필요하므로 즉시 로딩이 실용적.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<UserRole> roles = new HashSet<>();

    private User(
        String loginId, String encodedPassword, String name, String nickname,
        String ci, String ciHash, String di, String phoneNumber, boolean marketingConsent
    ) {
        this.loginId = loginId;
        this.password = encodedPassword;
        this.name = name;
        this.nickname = nickname;
        this.ci = ci;
        this.ciHash = ciHash;
        this.di = di;
        this.phoneNumber = phoneNumber;
        this.marketingConsent = marketingConsent;
    }

    public void changeProfileImageFile(Long profileImageFileId) {
        this.profileImageFileId = profileImageFileId;
    }

    /** 닉네임 변경 — 형식·중복 검증은 서비스가 수행하고 여기선 반영만 한다. */
    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changeMarketingConsent(boolean marketingConsent) {
        this.marketingConsent = marketingConsent;
        this.marketingConsentUpdatedAt = LocalDateTime.now(KST_CLOCK);
    }

    /** 역할 부여 — 이미 보유한 역할이면 no-op(unique 제약 위반 방지). */
    public void grantRole(Role role) {
        if (!hasRole(role)) {
            this.roles.add(UserRole.create(this, role));
        }
    }

    /** 역할 회수 — orphanRemoval로 user_roles 행이 물리 삭제된다. 미보유 역할이면 no-op. */
    public void revokeRole(Role role) {
        this.roles.removeIf(userRole -> userRole.getRole() == role);
    }

    public boolean hasRole(Role role) {
        return this.roles.stream().anyMatch(userRole -> userRole.getRole() == role);
    }

    /** 보유 역할을 Role 집합으로 반환한다(수동 정의라 Lombok의 Set&lt;UserRole&gt; getter를 대체). */
    public Set<Role> getRoles() {
        return this.roles.stream()
            .map(UserRole::getRole)
            .collect(() -> EnumSet.noneOf(Role.class), Set::add, Set::addAll);
    }

    /**
     * 회원탈퇴 — soft delete 마킹 후 개인정보를 전부 비운다.
     * 본 DB에는 id·loginId·삭제일만 유의미하게 남는다(아이디 재사용 차단 유지).
     * 반드시 아카이브 DB 이관이 성공한 뒤에 호출할 것(UserService.withdraw 순서 보장).
     * ciHash가 null이 되므로 같은 CI로 재가입할 수 있다(unique는 null 중복 허용).
     */
    public void withdraw() {
        delete();
        // 역할은 개인정보가 아니라 아카이브 이관 대상이 아니다. 전부 회수해 두면
        // 잔존 세션이 있어도 인가 가드의 역할 조회가 빈 집합을 반환해 403이 된다.
        this.roles.clear();
        this.password = null;
        this.name = null;
        this.nickname = null; // 개인정보 아님(이관 불요) — unique 반납 목적

        this.ci = null;
        this.ciHash = null;
        this.di = null;
        this.phoneNumber = null;
        this.profileImageFileId = null;
    }

    /** encodedPassword는 반드시 BCrypt 해시를 넘긴다 (원문 전달 금지). nickname은 유니크 발급본. */
    public static User create(
        String loginId, String encodedPassword, String name, String nickname,
        String ci, String ciHash, String di, String phoneNumber, boolean marketingConsent
    ) {
        return new User(
            loginId, encodedPassword, name, nickname, ci, ciHash, di, phoneNumber, marketingConsent);
    }

}
