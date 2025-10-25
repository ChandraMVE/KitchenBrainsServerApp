# Use a modern JDK runtime
FROM eclipse-temurin:17-jdk

# Create app directory
WORKDIR /app

# Copy your compiled WAR
COPY kitchenbrains.war /app/kitchenbrains.war

# Copy your downloads folder for images, logos, and slides
COPY downloads/ /app/downloads/

# Expose the port that Spring Boot uses
EXPOSE 8080

# Run the WAR directly (Spring Boot embedded Tomcat)
ENTRYPOINT ["java", "-jar", "kitchenbrains.war"]