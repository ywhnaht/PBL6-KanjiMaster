# Stage 1: Build stage
FROM eclipse-temurin:23-jdk-alpine AS build

WORKDIR /app

# 1. Copy chỉ pom.xml và Maven wrapper trước để tận dụng cache dependency
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# 2. Grant execution and download dependencies offline
RUN chmod +x mvnw \
    && ./mvnw dependency:go-offline -B

# 3. Copy source code sau khi cache dependencies xong
COPY src ./src

# 4. Build the application, skip tests to giảm thời gian
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:23-jre-alpine

WORKDIR /app

# Copy built jar
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
