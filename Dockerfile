FROM gradle:8.14-jdk21 AS build
WORKDIR /app

COPY build.gradle settings.gradle* ./
COPY gradle.properties* ./

RUN gradle dependencies --no-daemon

COPY src/ ./src/
COPY package.json pnpm-lock.yaml* vite.config.ts tailwind.config.js* components.json tsconfig.json ./

RUN gradle clean build -Pproduction -DskipTests -Pvaadin.productionMode=true --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=build /app/build/libs/AuthServer-*-SNAPSHOT.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.profiles.active=prod"]