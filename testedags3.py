from datetime import datetime
import json
import boto3
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.amazon.aws.hooks.sqs import SQSHook
from airflow.models import Variable

def read_s3_file(bucket_name, key, **kwargs):
    s3_hook = S3Hook(aws_conn_id='aws_default')
    s3_client = s3_hook.get_client_type('s3')
    obj = s3_client.get_object(Bucket=bucket_name, Key=key)
    data = obj['Body'].read().decode('utf-8')
    kwargs['ti'].xcom_push(key='file_content', value=data)

def read_schema(schema_file_key, **kwargs):
    s3_hook = S3Hook(aws_conn_id='aws_default')
    s3_client = s3_hook.get_client_type('s3')
    obj = s3_client.get_object(Bucket=schema_file_key['bucket_name'], Key=schema_file_key['key'])
    schema = json.loads(obj['Body'].read().decode('utf-8'))
    kwargs['ti'].xcom_push(key='schema', value=schema)

def process_file_to_json(**kwargs):
    ti = kwargs['ti']
    txt_data = ti.xcom_pull(task_ids='read_txt_file', key='file_content')
    schema = ti.xcom_pull(task_ids='read_schema', key='schema')
    
    lines = txt_data.split('\n')
    json_records = []
    
    for line in lines:
        if line.strip():
            record = {}
            for field in schema:
                field_name = field['name']
                start_pos = int(field['start_pos'])
                end_pos = int(field['end_pos'])
                record[field_name] = line[start_pos:end_pos].strip()
            json_records.append(record)
    
    kwargs['ti'].xcom_push(key='json_records', value=json_records)

def send_to_sqs(sqs_queue_name, **kwargs):
    ti = kwargs['ti']
    json_records = ti.xcom_pull(task_ids='process_file_to_json', key='json_records')
    
    sqs_hook = SQSHook(aws_conn_id='aws_default')
    queue_url = sqs_hook.get_queue_url(sqs_queue_name)
    
    for record in json_records:
        sqs_hook.send_message(queue_url, json.dumps(record))

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1),
    'retries': 1,
}

with DAG(
    'process_s3_txt_to_sqs',
    default_args=default_args,
    description='Read a positional TXT file from S3, convert to JSON and send to SQS',
    schedule_interval='@daily',
) as dag:

    read_txt_file = PythonOperator(
        task_id='read_txt_file',
        python_callable=read_s3_file,
        op_kwargs={
            'bucket_name': 'your-bucket-name',
            'key': 'path/to/your/txtfile.txt',
        },
        provide_context=True,
    )

    read_schema = PythonOperator(
        task_id='read_schema',
        python_callable=read_schema,
        op_kwargs={
            'schema_file_key': {
                'bucket_name': 'your-bucket-name',
                'key': 'path/to/your/schema.json'
            }
        },
        provide_context=True,
    )

    process_file_to_json = PythonOperator(
        task_id='process_file_to_json',
        python_callable=process_file_to_json,
        provide_context=True,
    )

    send_to_sqs = PythonOperator(
        task_id='send_to_sqs',
        python_callable=send_to_sqs,
        op_kwargs={
            'sqs_queue_name': 'your-sqs-queue-name',
        },
        provide_context=True,
    )

    read_txt_file >> read_schema >> process_file_to_json >> send_to_sqs
