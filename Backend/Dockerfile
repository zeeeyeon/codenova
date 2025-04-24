FROM gradle:8.3-jdk17 AS builder
WORKDIR /app

# Gradle 캐시 디렉토리 설정
ENV GRADLE_USER_HOME=/app/.gradle

# 캐시 디렉토리 클린
RUN rm -rf /app/.gradle && mkdir -p /app/.gradle && chmod -R 777 /app/.gradle

COPY . .

# 빌드 실행
RUN gradle clean build --no-daemon

# 실제 실행용 이미지
FROM openjdk:17-jdk
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
