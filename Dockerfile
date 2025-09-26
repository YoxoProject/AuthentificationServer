FROM gradle:8.14-jdk21 AS build
WORKDIR /app

# Install Node.js 20 and pnpm for Vaadin frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

COPY build.gradle settings.gradle* ./
COPY gradle.properties* ./

RUN gradle dependencies --no-daemon

COPY src/ ./src/
COPY package.json pnpm-lock.yaml* vite.config.ts components.json tsconfig.json ./

# Enable verbose logging for Tailwind CSS and Vite
ENV DEBUG=tailwindcss:*
ENV VITE_DEBUG=1
ENV NODE_ENV=production

# Install pnpm dependencies to ensure Tailwind CSS is available
RUN pnpm install

# Show debug information
RUN echo "=== Package.json Tailwind dependencies ===" && \
    grep -A 3 -B 3 tailwind package.json && \
    echo "=== Vite config ===" && \
    cat vite.config.ts && \
    echo "=== Frontend CSS files ===" && \
    find src/main/frontend -name "*.css" -type f

RUN gradle clean build -Pproduction -DskipTests -Pvaadin.productionMode=true --no-daemon --info
#RUN --mount=type=cache,target=/root/.gradle gradle clean build -Pproduction -DskipTests -Pvaadin.productionMode=true

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=build /app/build/libs/AuthServer-*-SNAPSHOT.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.profiles.active=prod"]