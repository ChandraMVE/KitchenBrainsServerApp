# Use a base JDK image
FROM eclipse-temurin:17-jdk

# Copy your WAR
COPY kitchenbrains.war /app/kitchenbrains.war

WORKDIR /app

# Expose the default Spring Boot port
EXPOSE 8080

# Run the WAR directly (Spring Boot will auto-launch embedded Tomcat)
ENTRYPOINT ["java", "-jar", "kitchenbrains.war"]