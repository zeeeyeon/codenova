FROM gradle:8.3-jdk17 AS builder
WORKDIR /app

ENV GRADLE_USER_HOME=/app/.gradle

COPY . .

RUN mkdir -p /app/.gradle && chmod -R 777 /app/.gradle
RUN gradle build --no-daemon
