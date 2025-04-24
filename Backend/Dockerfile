# Gradle 캐시 디렉토리 설정 및 권한 부여
ENV GRADLE_USER_HOME=/app/.gradle
RUN mkdir -p $GRADLE_USER_HOME && chmod -R 777 $GRADLE_USER_HOME
COPY build.gradle settings.gradle gradlew gradlew.bat /app/
COPY gradle /app/gradle
RUN chmod +x ./gradlew

# 의존성 먼저 다운로드 (캐시에 저장)
RUN ./gradlew dependencies --no-daemon || return 0

# 나머지 소스 코드 복사
COPY . .

# 빌드 실행
RUN ./gradlew clean build --no-daemon --stacktrace