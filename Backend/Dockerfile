# 빌드 단계에서 Gradle 캐시 위치를 변경
FROM gradle:8.3-jdk17 AS builder
WORKDIR /app

ENV GRADLE_USER_HOME=/app/.gradle  # ⬅️ 이 줄이 핵심
COPY . .

RUN mkdir -p /app/.gradle && chmod -R 777 /app/.gradle

RUN gradle build --no-daemon
