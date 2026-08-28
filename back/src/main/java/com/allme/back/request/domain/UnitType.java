package com.allme.back.request.domain;

/** 작업 규모 단위 — 카테고리가 결정한다(ServiceCategory.unitType). 시세 집계 시 규모 정규화 기준. */
public enum UnitType {
    PYEONG,  // 평수 (청소·인테리어·페인트)
    PAGE     // 페이지 수 (웹·디자인 제작)
}
