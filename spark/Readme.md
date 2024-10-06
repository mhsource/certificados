docker build -t spark-iu .

docker run --name spark-master --network spark-network -p 8080:8080 -p 7077:7077 spark-iu /bin/bash -c "/opt/spark/sbin/start-master.sh && tail -f /dev/null"

docker run --name spark-worker --network spark-network -p 8081:8081 spark-iu /bin/bash -c "/opt/spark/sbin/start-worker.sh spark://spark-master:7077 && tail -f /dev/null"

docker run --network spark-network spark-iu /bin/bash -c "/opt/spark/bin/spark-submit --master spark://spark-master:7077 /opt/spark-apps/app.py"
