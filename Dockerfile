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
# Start Tomcat manually and serve static folder directly
ENTRYPOINT ["sh", "-c", "java -jar kitchenbrains.war & sleep 15 && cp -r /app/external-files /usr/local/tomcat/webapps/ROOT/external-files && tail -f /dev/null"]
