package com.allme.back.user.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import com.allme.back.user.domain.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원-역할 매핑 — User 애그리거트가 소유하며 grantRole/revokeRole로만 조작한다.
 * unique(user_id, role)이 중복 부여를 차단하고, 선두 컬럼이 user_id라 역할 조회 인덱스를 겸한다.
 * 부여 시점은 BaseEntity의 created_date가 담당하고, 회수는 물리 삭제(orphanRemoval)다 —
 * 역할 이력이 필요해지면 그때 별도 감사 테이블로 분리한다.
 */
@Entity
@Table(
    name = "user_roles",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "role"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    private UserRole(User user, Role role) {
        this.user = user;
        this.role = role;
    }

    public static UserRole create(User user, Role role) {
        return new UserRole(user, role);
    }

}
