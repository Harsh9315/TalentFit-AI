# Step 1: Use Maven image to build the project
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy project files
COPY . .

# Compile without repackaging if main class fails
RUN mvn clean package -DskipTests -Dstart-class=com.talentfit.AtsEngineApplication

# Step 2: Use lightweight JRE to run the app
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
