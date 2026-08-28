package com.allme.back.request.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 서비스 카테고리 — 오픈 시 4개(CLAUDE.md "초기 범위는 좁게"). 표시 라벨은 프론트 상수(CATEGORIES)가 담당한다.
 * - slug: 프론트 URL 필터(/requests?category=web-design)와 같은 값. API 계약은 enum name(code)이다.
 * - requiresSite: 현장 방문형 여부 — 지역을 ONLINE으로 둘 수 없고, 상세 주소를 받을 수 있다.
 * - unitType: 작업 규모의 단위(시세 데이터 적재용) — 현장형은 평수, 웹·디자인은 페이지 수.
 */
@Getter
@RequiredArgsConstructor
public enum ServiceCategory {

    CLEANING("cleaning", true, UnitType.PYEONG),
    INTERIOR("interior", true, UnitType.PYEONG),
    PAINTING("painting", true, UnitType.PYEONG),
    WEB_DESIGN("web-design", false, UnitType.PAGE),
    ;

    private final String slug;
    private final boolean requiresSite;
    private final UnitType unitType;

}
