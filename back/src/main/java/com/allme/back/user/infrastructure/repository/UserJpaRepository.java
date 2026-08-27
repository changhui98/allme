package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.entity.User;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserJpaRepository extends JpaRepository<User, Long> {

    boolean existsByLoginId(String loginId);

    boolean existsByCiHash(String ciHash);

    Optional<User> findByLoginId(String loginId);

    boolean existsByNickname(String nickname);

    List<User> findAllByNicknameIsNullAndDeletedDateIsNull();

    /** 관리자 표시용 — 평문 컬럼(id·loginId)만 조회해 암호화 컬럼 복호화를 피한다 */
    @Query("select u.id, u.loginId from User u where u.id in :userIds")
    List<Object[]> findIdAndLoginIdByIdIn(@Param("userIds") Collection<Long> userIds);

    /** 관리자 회원 목록 전체 — 생성자 프로젝션으로 암호화 컬럼 미로딩. */
    @Query(
        value = """
            select new com.allme.back.user.domain.AdminUserRow(
                u.id, u.loginId, u.createdDate, u.deletedDate)
            from User u
            """,
        countQuery = "select count(u) from User u"
    )
    Page<AdminUserRow> findAllAdminRows(Pageable pageable);

    /**
     * 관리자 회원 목록 loginId 부분 일치 검색 — keyword는 non-null이어야 한다.
     * ":keyword is null or ... like" 한 쿼리로 합치면 null 바인딩이 PostgreSQL에서 bytea로 추론되어
     * "operator does not exist: character varying ~~ bytea" 오류가 나므로 전체 조회와 분리한다.
     */
    @Query(
        value = """
            select new com.allme.back.user.domain.AdminUserRow(
                u.id, u.loginId, u.createdDate, u.deletedDate)
            from User u
            where u.loginId like concat('%', :keyword, '%')
            """,
        countQuery = """
            select count(u)
            from User u
            where u.loginId like concat('%', :keyword, '%')
            """
    )
    Page<AdminUserRow> searchAdminRowsByLoginId(@Param("keyword") String keyword, Pageable pageable);

    /*
     * 역할 필터 — 키워드 유무 × 역할 조건(보유 / USER만)을 조합한 4개 쿼리.
     * 위와 같은 이유(LIKE null 바인딩)로 키워드 없는 버전을 분리하고, 역할은 exists 서브쿼리로 건다.
     */

    /** 해당 역할을 보유한 회원 */
    @Query(
        value = """
            select new com.allme.back.user.domain.AdminUserRow(
                u.id, u.loginId, u.createdDate, u.deletedDate)
            from User u
            where exists (select 1 from UserRole r where r.user = u and r.role = :role)
            """,
        countQuery = """
            select count(u) from User u
            where exists (select 1 from UserRole r where r.user = u and r.role = :role)
            """
    )
    Page<AdminUserRow> findAdminRowsByRole(@Param("role") Role role, Pageable pageable);

    @Query(
        value = """
            select new com.allme.back.user.domain.AdminUserRow(
                u.id, u.loginId, u.createdDate, u.deletedDate)
            from User u
            where u.loginId like concat('%', :keyword, '%')
              and exists (select 1 from UserRole r where r.user = u and r.role = :role)
            """,
        countQuery = """
            select count(u) from User u
            where u.loginId like concat('%', :keyword, '%')
              and exists (select 1 from UserRole r where r.user = u and r.role = :role)
            """
    )
    Page<AdminUserRow> searchAdminRowsByLoginIdAndRole(
        @Param("keyword") String keyword, @Param("role") Role role, Pageable pageable
    );

    /** 일반 회원 — USER 외 다른 역할이 없는 활성 회원(탈퇴 회원은 역할이 없어 제외) */
    @Query(
        value = """
            select new com.allme.back.user.domain.AdminUserRow(
                u.id, u.loginId, u.createdDate, u.deletedDate)
            from User u
            where exists (select 1 from UserRole r where r.user = u and r.role = com.allme.back.user.domain.Role.USER)
              and not exists (select 1 from UserRole r2 where r2.user = u and r2.role <> com.allme.back.user.domain.Role.USER)
            """,
        countQuery = """
            select count(u) from User u
            where exists (select 1 from UserRole r where r.user = u and r.role = com.allme.back.user.domain.Role.USER)
              and not exists (select 1 from UserRole r2 where r2.user = u and r2.role <> com.allme.back.user.domain.Role.USER)
            """
    )
    Page<AdminUserRow> findAdminRowsUserOnly(Pageable pageable);

    @Query(
        value = """
            select new com.allme.back.user.domain.AdminUserRow(
                u.id, u.loginId, u.createdDate, u.deletedDate)
            from User u
            where u.loginId like concat('%', :keyword, '%')
              and exists (select 1 from UserRole r where r.user = u and r.role = com.allme.back.user.domain.Role.USER)
              and not exists (select 1 from UserRole r2 where r2.user = u and r2.role <> com.allme.back.user.domain.Role.USER)
            """,
        countQuery = """
            select count(u) from User u
            where u.loginId like concat('%', :keyword, '%')
              and exists (select 1 from UserRole r where r.user = u and r.role = com.allme.back.user.domain.Role.USER)
              and not exists (select 1 from UserRole r2 where r2.user = u and r2.role <> com.allme.back.user.domain.Role.USER)
            """
    )
    Page<AdminUserRow> searchAdminRowsByLoginIdUserOnly(@Param("keyword") String keyword, Pageable pageable);

    long countByDeletedDateIsNull();

}
