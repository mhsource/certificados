FROM apache/spark:3.5.3-scala2.12-java17-python3-r-ubuntu

USER root

ADD ./app/requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt

RUN curl -L -o /opt/spark/jars/hadoop-aws-3.3.2.jar "https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/3.3.2/hadoop-aws-3.3.2.jar"

RUN curl -L -o /opt/spark/jars/aws-java-sdk-bundle-1.11.1026.jar "https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.11.1026/aws-java-sdk-bundle-1.11.1026.jar"

RUN mkdir -p /opt/spark-apps

ADD ./app/app.py /opt/spark-apps/app.py

EXPOSE 7077 8080 6066 8081
