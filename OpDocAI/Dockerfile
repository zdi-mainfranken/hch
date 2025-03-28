FROM openjdk:21-slim
COPY . /code/jhipster-app/
WORKDIR /code/jhipster-app/
RUN \
    rm -Rf target node_modules && \
    chmod +x mvnw && \
    sleep 1 && \
    ./mvnw package -DskipTests && \
    mv /code/jhipster-app/target/*.jar /code/ && \
    rm -Rf /code/jhipster-app/ /root/.m2 /root/.cache /tmp/* /var/tmp/*

ENV SPRING_OUTPUT_ANSI_ENABLED=ALWAYS \
    JAVA_OPTS=""
ENTRYPOINT exec java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar /code/*.jar
EXPOSE 8080
