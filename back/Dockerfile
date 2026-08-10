# syntax=docker/dockerfile:1
# 빌드: Gradle 래퍼로 bootJar 생성 (Gradle 배포판·의존성은 캐시 마운트로 재사용)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
# 소스 복사 전에 의존성만 미리 받아 레이어 캐시 활용 (실패해도 빌드 단계에서 재시도되므로 무시)
RUN --mount=type=cache,target=/root/.gradle ./gradlew dependencies --no-daemon > /dev/null 2>&1 || true

COPY src ./src
RUN --mount=type=cache,target=/root/.gradle ./gradlew bootJar --no-daemon

# 실행: JRE만 포함한 경량 이미지
FROM eclipse-temurin:21-jre AS run
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
