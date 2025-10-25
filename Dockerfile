# Use modern JDK runtime
FROM eclipse-temurin:17-jdk

# Create working directory
WORKDIR /app

# Copy your compiled WAR
COPY kitchenbrains.war /app/kitchenbrains.war

# Copy static resources folder (images, CSS, JS)
COPY external-files/ /app/external-files/

# Copy Spring Boot external configuration
COPY application.properties /app/application.properties

# Expose the Spring Boot port
EXPOSE 8080

# Start Spring Boot app with explicit config file
	
ENTRYPOINT ["java", "-jar", "kitchenbrains.war", \
    "--spring.config.additional-location=file:/app/application.properties", \
    "--spring.resources.static-locations=file:/app/external-files/,classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/"]	