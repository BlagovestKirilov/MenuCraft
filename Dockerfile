# ---- Build Stage ----
FROM eclipse-temurin:25-jdk-noble AS builder
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

# Download OpenTelemetry Java Agent
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /app/opentelemetry-javaagent.jar
RUN chown springuser:springuser /app/opentelemetry-javaagent.jar

USER springuser

# Copy the JAR from the builder stage
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8090

# Use array syntax for ENTRYPOINT
ENTRYPOINT ["java", "-javaagent:/app/opentelemetry-javaagent.jar", "-jar", "app.jar", "--spring.profiles.active=prod"]
