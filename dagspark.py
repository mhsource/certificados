from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago

default_args = {
    'owner': 'airflow',
    'start_date': days_ago(1),
}

dag = DAG(
    'spark_send_to_sqs_dag',
    default_args=default_args,
    description='DAG to send Spark output to SQS',
    schedule_interval=None,
)

def spark_job():
    # Inclua o código do Spark para enviar para o SQS
    import boto3
    from pyspark.sql import SparkSession

    def send_partition_to_sqs(partition):
        sqs = boto3.client('sqs', region_name='us-east-1')
        queue_url = 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue'
        
        for row in partition:
            line = row['value']
            response = sqs.send_message(
                QueueUrl=queue_url,
                MessageBody=line
            )
            print(f"Sent line to SQS: {line}")

    spark = SparkSession.builder.appName("SparkToSQS").getOrCreate()
    input_path = "s3a://your-bucket/input.txt"
    df = spark.read.text(input_path)
    df.foreachPartition(send_partition_to_sqs)
    spark.stop()

# Tarefa PythonOperator para executar o job Spark
spark_task = PythonOperator(
    task_id='run_spark_to_sqs',
    python_callable=spark_job,
    dag=dag,
)

spark_task
