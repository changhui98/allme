package com.allme.back.inquiry.application.service;

import com.allme.back.global.exception.AppException;
import com.allme.back.inquiry.domain.InquiryErrorCode;
import com.allme.back.inquiry.domain.InquiryStatus;
import com.allme.back.inquiry.domain.entity.Inquiry;
import com.allme.back.inquiry.domain.repository.InquiryRepository;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 1:1 문의 유스케이스 — 회원의 작성·내 문의 조회, 관리자의 목록·답변.
 * user 도메인에는 리포지토리 인터페이스로만 의존한다(provider 도메인과 같은 관례).
 */
@Service
@RequiredArgsConstructor
public class InquiryService {

    /** 목록 페이지 크기 상한 — 과대 요청 방지 */
    private static final int MAX_PAGE_SIZE = 50;

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final UserAdminQueryRepository userAdminQueryRepository;

    /** 문의 작성 — 탈퇴·부재 회원은 U011. */
    @Transactional
    public Inquiry submit(Long userId, String title, String content) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(UserErrorCode.UNAUTHORIZED));
        if (user.isDeleted()) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
        return inquiryRepository.save(Inquiry.create(userId, title, content));
    }

    /** 내 문의 1건 — 타인 문의는 존재를 노출하지 않고 I001. */
    public Inquiry getMine(Long userId, Long inquiryId) {
        return inquiryRepository.findByIdAndUserId(inquiryId, userId)
            .orElseThrow(() -> new AppException(InquiryErrorCode.INQUIRY_NOT_FOUND));
    }

    /** 내 문의 목록 — 최신순. */
    public Page<Inquiry> getMyPage(Long userId, int page, int size) {
        return inquiryRepository.findPageByUserId(userId, pageable(page, size));
    }

    /** 관리자 조회 */
    public Inquiry getById(Long inquiryId) {
        return inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new AppException(InquiryErrorCode.INQUIRY_NOT_FOUND));
    }

    /** 관리자 목록 — status가 null이면 전체, 최신순. */
    public Page<Inquiry> getPage(InquiryStatus statusOrNull, int page, int size) {
        return inquiryRepository.findPage(statusOrNull, pageable(page, size));
    }

    /** 답변 등록·수정 — 답변 완료 상태에서도 다시 호출하면 내용을 덮어쓴다. */
    @Transactional
    public void answer(Long inquiryId, Long adminUserId, String answer) {
        getById(inquiryId).answer(adminUserId, answer);
    }

    /** 표시용 loginId 배치 조회 — 컨트롤러의 응답 조립용(행당 쿼리 금지). */
    public Map<Long, String> loginIdsOf(Collection<Long> userIds) {
        return userAdminQueryRepository.findLoginIdsByUserIds(userIds);
    }

    public long countByStatus(InquiryStatus status) {
        return inquiryRepository.countByStatus(status);
    }

    private static PageRequest pageable(int page, int size) {
        return PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "id")
        );
    }

}
