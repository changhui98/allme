package com.allme.back.user.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 엔티티. 현재는 아이디 중복확인에 필요한 최소 필드만 정의하고,
 * 가입(join) API 구현 시 password·name·ci 등으로 확장한다.
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

}
