FROM gradle:8.3-jdk17 AS builder
WORKDIR /app
COPY --chown=gradle:gradle . /app

USER root

RUN gradle clean build --stacktrace -x test -no-daemon

FROM openjdk:17-jdk
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
