# Use a modern JDK runtime
FROM eclipse-temurin:17-jdk

# Create app directory
WORKDIR /app

# Copy your compiled WAR
COPY kitchenbrains.war /app/kitchenbrains.war

# Copy external static files
COPY external-files/ /app/external-files/

# Expose port
EXPOSE 8080

# Run Spring Boot app and tell it to serve static content from /app/external-files
ENTRYPOINT ["java", "-jar", "kitchenbrains.war", \
  "--server.port=8080", \
  "--spring.resources.static-locations=file:/app/external-files/,classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/"]