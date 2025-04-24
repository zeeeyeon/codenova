FROM gradle:8.3-jdk17

ENV GRADLE_USER_HOME=/app/.gradle

WORKDIR /app

COPY . .

RUN mkdir -p /app/.gradle && chmod -R 777 /app/.gradle

RUN gradle build --no-daemon

FROM openjdk:17-jdk
WORKDIR /app
COPY --from=0 /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
