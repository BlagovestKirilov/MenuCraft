# ---- Build Stage ----
FROM eclipse-temurin:25-jdk-noble AS builder
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
WORKDIR /build

# Better caching: only re-run if dependencies change
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY src ./src
RUN ./mvnw clean package -DskipTests

# ---- Runtime Stage ----
# Use JRE for a smaller, more secure footprint
FROM eclipse-temurin:25-jre-noble

# Create a non-privileged user for security
RUN useradd -ms /bin/sh springuser

WORKDIR /app

# Create logs directory with correct ownership before switching user
RUN mkdir -p /app/logs && chown springuser:springuser /app/logs

# Download Sentry OpenTelemetry agent
ADD --chown=springuser:springuser https://repo1.maven.org/maven2/io/sentry/sentry-opentelemetry-agent/8.33.0/sentry-opentelemetry-agent-8.33.0.jar /app/sentry-agent.jar

USER springuser

# Copy the JAR from the builder stage
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8090

ENV SENTRY_AUTO_INIT=false

# Use array syntax for ENTRYPOINT
ENTRYPOINT ["java", "-javaagent:/app/sentry-agent.jar", "-jar", "app.jar", "--spring.profiles.active=prod"]
