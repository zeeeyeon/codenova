# 빌드 스테이지
FROM gradle:8.3-jdk17 AS builder
WORKDIR /app
COPY . .
ENV GRADLE_USER_HOME=/app/.gradle
RUN mkdir -p /app/.gradle && chmod -R 777 /app/.gradle
RUN gradle build --no-daemon

FROM openjdk:17-jdk
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
