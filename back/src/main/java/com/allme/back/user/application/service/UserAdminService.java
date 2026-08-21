package com.allme.back.user.application.service;

import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/**
 * 관리자용 회원 조회 유스케이스 — 인증 중심의 UserService와 관심사를 분리한다.
 * 조회 전용(쓰기 없음)이라 트랜잭션 불필요.
 */
@Service
@RequiredArgsConstructor
public class UserAdminService {

    /** 목록 페이지 크기 상한 — 과대 요청 방지 */
    private static final int MAX_PAGE_SIZE = 50;

    private final UserAdminQueryRepository userAdminQueryRepository;

    /**
     * 회원 검색 — loginId 부분 일치(공백/빈 문자열은 전체), 가입 최신순(id desc — created_date 정렬과 동치).
     * name 등 개인정보 컬럼은 비결정적 암호문이라 검색 키로 쓸 수 없다.
     */
    public Page<AdminUserRow> search(String loginIdKeyword, int page, int size) {
        String keyword = loginIdKeyword != null && !loginIdKeyword.isBlank()
            ? loginIdKeyword.trim()
            : null;
        PageRequest pageable = PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "id")
        );
        return userAdminQueryRepository.search(keyword, pageable);
    }

    /** 페이지 회원들의 역할 배치 조회 — 응답 조립용. */
    public Map<Long, Set<Role>> rolesOf(Collection<Long> userIds) {
        return userAdminQueryRepository.findRolesByUserIds(userIds);
    }

    public long countActiveUsers() {
        return userAdminQueryRepository.countActive();
    }

    public long countProviders() {
        return userAdminQueryRepository.countByRole(Role.PROVIDER);
    }

}
