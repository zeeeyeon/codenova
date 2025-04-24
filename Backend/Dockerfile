FROM gradle:8.3-jdk17 AS builder
WORKDIR /app

# Gradle 캐시 디렉토리 설정
ENV GRADLE_USER_HOME=/app/.gradle

# 캐시 디렉토리 생성 및 권한 설정
RUN mkdir -p $GRADLE_USER_HOME
RUN chmod -R 777 $GRADLE_USER_HOME

# 먼저 빌드 스크립트만 복사
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 의존성 충돌 해결 코드 추가
RUN echo "configurations.all { resolutionStrategy.force 'com.fasterxml.jackson.core:jackson-core:2.16.1' }" >> build.gradle

# 의존성 먼저 다운로드
RUN gradle dependencies --no-daemon

# 나머지 소스 코드 복사
COPY . .

# 빌드 실행
RUN gradle clean build --no-daemon

# 실제 실행용 이미지
FROM openjdk:17-jdk
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]