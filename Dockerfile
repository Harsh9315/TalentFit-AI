# Step 1: Use OpenJDK 17 base image
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy all project files
COPY . .

# Grant execution permission to mvnw and build the jar
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Step 2: Lightweight JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
