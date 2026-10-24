#Start with a base image containing Java runtime
FROM openjdk:21-ea-21-jdk-slim

#Add the application's jar to the image
COPY target/payTrackEdu-0.0.1-SNAPSHOT.jar payTrackEdu-0.0.1-SNAPSHOT.jar

#Execute the application
ENTRYPOINT ["java","-jar","payTrackEdu-0.0.1-SNAPSHOT.jar"]