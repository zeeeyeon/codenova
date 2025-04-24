FROM gradle:8.3-jdk17 AS builder
WORKDIR /app

ENV GRADLE_USER_HOME=/app/.gradle

RUN mkdir -p $GRADLE_USER_HOME && chmod -R 777 $GRADLE_USER_HOME

COPY . .

RUN rm -rf $GRADLE_USER_HOME/caches
RUN gradle clean build --no-daemon

FROM openjdk:17-jdk
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
