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

# Add this line to include external static location
ENTRYPOINT ["java", "-jar", "kitchenbrains.war", \
    "--spring.web.resources.static-locations=file:/app/downloads/,classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/"]