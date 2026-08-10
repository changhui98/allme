# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 현재 상태: 초기 세팅 (화면 설계 시작 전)

- `올미_서비스_기획안.md` — "올미(allme)" 통합 서비스 마켓플레이스 기획안 (v0.1 초안, 2026-06-12)
- `front/` — 프론트엔드 프로젝트. **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + ESLint**로 초기 세팅 완료. 소스는 `front/src/app/`에 위치.
- `back/` — 백엔드 프로젝트. **Spring Boot 4.1.0 + Java 21 + Gradle**로 초기 세팅 완료(기존 계획의 3.x 대신 4.x로 확정). 패키지 루트는 `com.allme.back`.

추가 프론트 라이브러리(TanStack Query/Zustand/RHF/Zod)와 백엔드의 QueryDSL·Security·Redis는 아직 *계획* 단계이며, 구현이 진행되면 이 문서를 갱신한다.

### 백엔드 DDD 구조 (`back/src/main/java/com/allme/back/`)

도메인별 최상위 폴더(`user`, …) + 공통 `global` 패키지 구조. 각 도메인은 4계층으로 나눈다:

- `application/service/`(유스케이스 서비스) · `application/port/`(외부 연동 인터페이스)
- `domain/` — 루트에 `~ErrorCode`·도메인 예외, `entity/`(JPA 엔티티), `repository/`(**인터페이스만**)
- `infrastructure/repository/`(`~JpaRepository`·`~RepositoryImpl` 구현체) 및 외부 어댑터
- `presentation/` — `controller/`, `dto/request/`, `dto/response/`

규칙: application은 domain 인터페이스에만 의존(DIP). 엔티티는 `@Getter` + `@NoArgsConstructor(PROTECTED)` + `global/entity/BaseEntity` 상속. 예외는 도메인별 `~ErrorCode` enum → `AppException` → `GlobalExceptionHandler` 흐름. 새 도메인 추가 시 이 구조를 그대로 적용한다.

### 백엔드 개발 명령 (`back/`에서 실행)

```bash
docker compose up -d db   # PostgreSQL 기동 (저장소 루트에서)
cd back
./gradlew build           # 빌드 + 테스트
./gradlew bootRun         # 개발 서버 (8080)
```

- **gitignore 통합**: `front/`·`back/` 모두 저장소 루트의 `.gitignore` 한 곳에서 관리한다. 하위 폴더에 별도 `.gitignore`를 만들지 말 것.

### 프론트엔드 개발 명령 (`front/`에서 실행)

```bash
cd front
npm run dev     # 개발 서버 (Turbopack). 포트 점유 시: npm run dev -- -p 3100
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

- **CSS 초기화**: 별도 reset 라이브러리를 쓰지 않는다. Tailwind 내장 **Preflight**가 기본 리셋을 담당하고, 프로젝트 공통 base 스타일은 `front/src/app/globals.css`의 `@layer base` 블록에 추가한다(폰트/미디어/폼 요소 보강 등). normalize.css 같은 중복 reset을 도입하지 말 것.
- **폰트**: 현재는 한글 친화 시스템 폰트 스택(globals.css). 웹폰트(Pretendard)는 추후 `next/font`로 연동 예정.

## 제품 개요

**올미(allme)** — 분야 제한 없는 수평형(horizontal) 서비스 마켓플레이스. 청소·인테리어·페인트·웹제작 등 모든 분야의 서비스 업체(공급자)와 일반 사용자(수요자)를 연결하고, **탐색 → 예약 → 결제 → 작업 완료 확인 → 정산**의 전 거래 사이클을 플랫폼 안에서 처리한다.

경쟁사(숨고·크몽 = 매칭 중심, 집닥·오늘의집 = 특정 분야)와의 차별점은 **분야 무제한 확장성 + 결제·정산까지 플랫폼 내 일괄 처리 + (v2) 시세 데이터 제공**이다.

### MVP의 정의 (가장 중요한 제약)

> MVP의 기준은 기능 수가 아니라 **"거래 사이클 1회전이 끊김 없이 완결되는 것"**이다.

핵심 루프:
```
[업체]   가입 → 업체 등록(프로필·서비스·가격) → 예약 수락 → 작업 수행 → 완료 처리 → 정산
[사용자] 가입 → 업체 탐색/검색 → 상세 확인 → 예약 요청 → 결제 → 결과물 수령 확인 → 리뷰
```

새 기능을 제안·구현할 때는 항상 "이것이 거래 루프 1회전 완결에 필요한가?"를 먼저 따진다. 필요 없으면 Post-MVP 로드맵으로 미룬다.

## 계획된 기술 스택

### 백엔드 (확정: Java + Spring Boot)
- **언어/프레임워크**: Java 21 (LTS) + Spring Boot 4.x (4.1.0으로 세팅 완료) — 결제·정산 도메인 레퍼런스가 풍부하고, 트랜잭션 관리(`@Transactional`)가 성숙해 에스크로 거래 상태 머신 구현에 유리
- **DB**: PostgreSQL — 거래·정산은 트랜잭션 무결성이 필수라 RDB 사용
- **ORM**: Spring Data JPA (Hibernate) + QueryDSL (탐색 필터 등 동적 쿼리)
- **인증/보안**: Spring Security + OAuth2 Client (카카오·구글)
- **캐시/세션**: Redis (Spring Data Redis)
- **파일 저장**: S3 호환 스토리지 (포트폴리오 이미지, 결과물 파일)

### 프론트엔드 (추천: Next.js + TypeScript)
- **프레임워크**: Next.js (App Router)
- **스타일**: Tailwind CSS
- **상태/데이터**: TanStack Query (서버 상태) + Zustand (클라이언트 상태)
- **폼**: React Hook Form + Zod (백엔드와 검증 스키마 공유 가능)
- **차트 (v2 시세 기능)**: Recharts 또는 ECharts

> 설계 의도: 백엔드가 Java라 프론트(TS)와 DTO·Zod 스키마를 직접 공유할 수 없으므로, **OpenAPI 스펙(springdoc-openapi)을 단일 API 계약**으로 삼고 프론트 타입을 스펙에서 자동 생성(openapi-typescript 등)한다. 백엔드 검증은 Bean Validation, 프론트 단 검증은 Zod로 각자 처리. **SEO가 매출과 직결**되므로(예: "강남 입주청소" 검색 유입) 업체 상세/카테고리 페이지는 SSR이 필수다.

### 주요 외부 연동 (MVP)
- **PG/에스크로**: 토스페이먼츠 또는 포트원 (카드/간편결제)
- **소셜 로그인**: 카카오, 구글 OAuth
- **사업자등록번호 진위확인**: 국세청 사업자등록정보 진위확인 API
- **알림**: 카카오 알림톡 (예약 수락/완료) + 이메일

> 절충안으로, 메인 API는 Spring Boot로 두고 v2의 **시세 집계·통계 배치만 Python(pandas 등)**으로 분리하는 구성을 염두에 둔다.

## 핵심 아키텍처 원칙 (구현 시 반드시 지킬 것)

### 1. 에스크로 결제가 거래 모델의 중심
결제금을 플랫폼이 보관 → 사용자가 **"작업 완료 확인(구매 확정)"** 후 업체에 정산한다. 이는 분쟁·먹튀를 막는 핵심 장치로 MVP에서 빠질 수 없다. 거래 상태 머신(예약요청 → 수락 → 결제 → 작업중 → 완료처리 → 구매확정/자동확정 → 정산)을 명확히 모델링하고, **완료 처리 후 N일 경과 시 자동 구매확정** 정책을 포함한다.

### 2. 시세 데이터를 첫날부터 적재 (가장 자주 놓치는 설계 포인트)
v2 시세 차트 기능은 거래 데이터가 쌓여야 의미가 있다. **나중에 만들 기능이라도 데이터는 첫날부터 쌓아야 한다.** MVP 시점부터 거래/완료 테이블에 다음을 정규화해 저장한다:

- `category_id` (분야)
- `region_code` (행정구역 단위 지역)
- `amount` (실거래 금액)
- `completed_at` (완료 시점)
- `unit_info` (평수/페이지 수 등 작업 규모 — JSON)

이렇게 쌓으면 v2에서 `카테고리 × 지역 × 날짜별 평균/중앙값` 집계 테이블만 추가해 차트를 바로 구현할 수 있다.

### 3. 계정 1개 = 다중 역할
하나의 계정에서 **일반 사용자 / 업체** 역할을 전환할 수 있다. 권한 모델은 계정-역할 분리로 설계한다.

### 4. 초기 범위는 좁게
오픈 시 **카테고리 4개**(청소 / 인테리어 / 페인트·도장 / 웹·디자인 제작)와 **1개 지역(예: 서울)**으로 한정한다. 마켓플레이스의 닭-달걀 문제 때문에 공급(업체)을 먼저 확보하는 전략이며, 코드도 이 좁은 범위에 최적화한다.

## MVP 범위 경계 (Out of Scope — v2 이후로)

아래는 의도적으로 MVP에서 제외된 항목이다. 별도 지시 없이 선제 구현하지 말 것:

- **전자계약서 생성·서명** (v2 핵심 차별화) — MVP에선 "예약+결제 내역"이 계약 증빙 역할
- **시세 대시보드/차트** (v2) — 단, 위 2번 원칙대로 데이터 적재는 MVP부터
- 비교 견적(여러 업체 동시 견적), 업체 CRM/일정관리, 다국어·해외결제, 네이티브 앱(MVP는 반응형 웹), 추천 알고리즘(초기엔 최신순/평점순 정렬)

## 참고

상세 기획(수익 모델, 성공 지표, 로드맵 v1.5/v2/v3, 일정, 리스크)은 `올미_서비스_기획안.md`를 참조한다. 설계 결정이 기획안과 충돌할 경우, 기획안을 우선 확인하고 사용자에게 알린다.
