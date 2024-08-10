import redis
import json
import csv
import pymysql
from awsglue.utils import getResolvedOptions
import sys
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

# Função para conectar ao Redis
def connect_to_redis(redis_host, redis_port, redis_db):
    return redis.Redis(host=redis_host, port=redis_port, db=redis_db)

# Função para ler dados da tabela no Redis
def read_table_from_redis(redis_client, table_key):
    table_data = redis_client.hgetall(table_key)
    if not table_data:
        raise ValueError(f"Nenhum dado encontrado para a chave: {table_key}")
    decoded_data = {k.decode('utf-8'): json.loads(v.decode('utf-8')) for k, v in table_data.items()}
    return decoded_data

# Função para transformar JSON complexo em JSON simples
def transform_json(decoded_data):
    transformed_data = []
    for key, value in decoded_data.items():
        if isinstance(value, list):
            for item in value:
                transformed_data.append({"id": key, "contaid": item['contaid']})
        else:
            transformed_data.append({"id": key, "contaid": value})
    return transformed_data

# Função para gerar CSV
def generate_csv(data, csv_file_path):
    csv_columns = data[0].keys()
    try:
        with open(csv_file_path, 'w') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
            writer.writeheader()
            for item in data:
                writer.writerow(item)
    except IOError as e:
        raise IOError(f"Erro ao escrever CSV: {str(e)}")

# Função para conectar ao MySQL
def connect_to_mysql(mysql_host, mysql_port, mysql_user, mysql_password, mysql_db):
    return pymysql.connect(host=mysql_host,
                           user=mysql_user,
                           password=mysql_password,
                           database=mysql_db,
                           port=mysql_port)

# Função para inserir dados no MySQL de maneira transacional
def insert_data_to_mysql(connection, data, mysql_table):
    csv_columns = data[0].keys()
    insert_query = f"INSERT INTO {mysql_table} ({', '.join(csv_columns)}) VALUES ({', '.join(['%s'] * len(csv_columns))})"
    
    try:
        with connection.cursor() as cursor:
            for item in data:
                cursor.execute(insert_query, list(item.values()))
            connection.commit()
    except pymysql.MySQLError as e:
        connection.rollback()
        raise pymysql.MySQLError(f"Erro ao inserir dados no MySQL: {str(e)}")
    finally:
        connection.close()

# Função principal do Glue
def main():
    # Obtenha os argumentos do Glue
    args = getResolvedOptions(sys.argv, ['redis_host', 'redis_port', 'redis_db', 'table_key', 
                                         'mysql_host', 'mysql_port', 'mysql_user', 'mysql_password', 
                                         'mysql_db', 'mysql_table'])

    # Conectar ao Redis
    redis_client = connect_to_redis(args['redis_host'], int(args['redis_port']), int(args['redis_db']))

    # Ler e transformar os dados
    decoded_data = read_table_from_redis(redis_client, args['table_key'])
    transformed_data = transform_json(decoded_data)

    # Gerar arquivo CSV
    csv_file_path = '/tmp/output.csv'
    generate_csv(transformed_data, csv_file_path)

    # Conectar ao MySQL e inserir os dados
    mysql_connection = connect_to_mysql(args['mysql_host'], int(args['mysql_port']), args['mysql_user'], args['mysql_password'], args['mysql_db'])
    insert_data_to_mysql(mysql_connection, transformed_data, args['mysql_table'])

# Executar a função principal
if __name__ == "__main__":
    main()
