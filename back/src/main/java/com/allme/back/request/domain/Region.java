package com.allme.back.request.domain;

/**
 * 요청 지역 — 오픈 지역인 서울의 25개 자치구 + ONLINE(비대면·지역 무관).
 * 표시 라벨은 프론트 상수(REGIONS)가 담당하고 API 계약은 enum name이다.
 * ONLINE은 현장 방문이 필요 없는 카테고리(ServiceCategory.requiresSite == false)에서만 허용한다.
 */
public enum Region {
    GANGNAM, GANGDONG, GANGBUK, GANGSEO, GWANAK,
    GWANGJIN, GURO, GEUMCHEON, NOWON, DOBONG,
    DONGDAEMUN, DONGJAK, MAPO, SEODAEMUN, SEOCHO,
    SEONGDONG, SEONGBUK, SONGPA, YANGCHEON, YEONGDEUNGPO,
    YONGSAN, EUNPYEONG, JONGNO, JUNG, JUNGNANG,
    ONLINE
}
