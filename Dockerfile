# Use a modern JDK runtime
FROM eclipse-temurin:17-jdk

# Create app directory
WORKDIR /app

# Copy your compiled WAR
COPY kitchenbrains.war /app/kitchenbrains.war

# Copy your external files (logos, slides)
COPY external-files/ /app/external-files/

RUN ls --recursive /app/external-files/

# Expose the port that Spring Boot uses
EXPOSE 8080

# Tell Spring Boot to serve /app/external-files as static
ENTRYPOINT ["java", "-jar", "kitchenbrains.war", \
    "--spring.resources.static-locations=file:/app/external-files/,classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/"]