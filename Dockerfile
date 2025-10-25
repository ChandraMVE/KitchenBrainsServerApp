# Use a modern JDK runtime
FROM eclipse-temurin:17-jdk

# Create app directory
WORKDIR /app

# Copy your compiled WAR
COPY kitchenbrains.war /app/kitchenbrains.war
COPY application.properties /app/application.properties

# Copy external static files
COPY external-files/ /app/external-files/

# Expose port
EXPOSE 8080

# Run Spring Boot app and tell it to serve static content from /app/external-files
ENTRYPOINT ["java", "-jar", "kitchenbrains.war", "--spring.config.location=file:/app/application.properties"]
