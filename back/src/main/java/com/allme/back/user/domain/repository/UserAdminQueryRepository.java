package com.allme.back.user.domain.repository;

import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 관리자 화면 전용 경량 조회 — User 엔티티를 로딩하면 암호화 컬럼(name·ci·di·phone)
 * 복호화가 행마다 발생하므로, 관리자 목록/표시는 평문 컬럼만 뽑는 프로젝션 쿼리를 쓴다
 * (UserRoleRepository와 같은 근거). 쓰기는 여기서 하지 않는다.
 */
public interface UserAdminQueryRepository {

    /** 표시용 loginId 배치 조회 — 목록 행당 쿼리를 만들지 않기 위한 in 절 조회. */
    Map<Long, String> findLoginIdsByUserIds(Collection<Long> userIds);

    /**
     * 회원 목록 — loginId 부분 일치 검색(null이면 전체) × 역할 필터(null이면 전체), 정렬은 호출부 Pageable에 위임.
     * roleOrNull이 USER면 "일반 회원"(USER 외 역할이 없는 회원), 그 외 역할은 보유 여부.
     */
    Page<AdminUserRow> search(String loginIdKeywordOrNull, Role roleOrNull, Pageable pageable);

    /** 페이지 회원들의 역할 배치 조회 — 행당 쿼리 금지. */
    Map<Long, Set<Role>> findRolesByUserIds(Collection<Long> userIds);

    /** 활성(미탈퇴) 회원 수 */
    long countActive();

    /** 해당 역할 보유 회원 수 — 탈퇴 시 역할이 전부 회수되므로 활성 회원 기준과 동치. */
    long countByRole(Role role);

}
