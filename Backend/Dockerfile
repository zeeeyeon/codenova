FROM gradle:8.3-jdk17
ENV GRADLE_USER_HOME=/app/.gradle
WORKDIR /app
COPY . .
RUN gradle build --no-daemon
