COPY --chown=gradle:gradle . /app

USER root

RUN gradle clean build --stacktrace -x test -no-daemon