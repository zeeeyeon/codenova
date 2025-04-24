FROM gradle:8.3-jdk17 AS builder
WORKDIR /app

# Gradle 캐시 디렉토리 명확하게 설정
ENV GRADLE_USER_HOME=/app/.gradle

# 캐시 디렉토리 생성 및 권한 설정 (순서 중요)
RUN mkdir -p $GRADLE_USER_HOME
RUN chmod -R 777 $GRADLE_USER_HOME

# 소스 복사
COPY . .

# 빌드 실행 (디버깅 정보 추가)
RUN gradle clean build --no-daemon --stacktrace

# 실제 실행용 이미지
FROM openjdk:17-jdk
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]