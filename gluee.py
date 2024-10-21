import sys
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.utils import getResolvedOptions
from awsglue.dynamicframe import DynamicFrame
from botocore.exceptions import ClientError

# Parâmetros do Job
args = getResolvedOptions(sys.argv, ['JOB_NAME'])

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Configuração de nomes
database_name = "meu_database"
table_name = "minha_tabela"
s3_output_path = "s3://meu-bucket/path/to/output/"

# Função para verificar se o banco de dados existe
def database_exists(glue_context, db_name):
    try:
        glue_context.get_database(db_name)
        print(f"Banco de dados '{db_name}' já existe.")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'EntityNotFoundException':
            print(f"Banco de dados '{db_name}' não encontrado. Será criado.")
            return False
        else:
            raise

# Função para verificar se a tabela existe
def table_exists(glue_context, db_name, tbl_name):
    try:
        glue_context.get_table(db_name, tbl_name)
        print(f"Tabela '{tbl_name}' já existe no banco de dados '{db_name}'.")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'EntityNotFoundException':
            print(f"Tabela '{tbl_name}' não encontrada. Será criada.")
            return False
        else:
            raise

# Verifica e cria o banco de dados se necessário
if not database_exists(glueContext, database_name):
    glueContext.create_database(database_name)

# Configurações JDBC para conectar ao MySQL
mysql_options = {
    "url": "jdbc:mysql://<mysql-host>:3306/<mysql-database>",
    "user": "<mysql-username>",
    "password": "<mysql-password>",
    "dbtable": "<mysql-table>",
    "customJdbcDriverS3Path": "s3://<path-to-jdbc-driver>/mysql-connector-java.jar",  # Opcional
    "customJdbcDriverClassName": "com.mysql.cj.jdbc.Driver"
}

# Lendo dados do MySQL como DynamicFrame
mysql_dynamic_frame = glueContext.create_dynamic_frame.from_options(
    connection_type="jdbc",
    connection_options=mysql_options
)

# Verifica se a tabela existe para decidir o modo de escrita
if table_exists(glueContext, database_name, table_name):
    print(f"Reescrevendo a tabela '{table_name}'...")
    write_mode = "overwrite"  # Sobrescreve os dados existentes
else:
    print(f"Criando a nova tabela '{table_name}'...")
    write_mode = "append"  # Cria a tabela e insere os dados

# Escrevendo os dados no Glue Catalog e armazenando no S3
glueContext.write_dynamic_frame.from_options(
    frame=mysql_dynamic_frame,
    connection_type="s3",
    connection_options={
        "path": s3_output_path,
        "partitionKeys": []
    },
    format="parquet",
    format_options={"compression": "SNAPPY"},
    transformation_ctx="datasink",
    additional_options={"enableUpdateCatalog": True, "updateBehavior": write_mode},
    database=database_name,
    table_name=table_name
)

# Finaliza o Job
job.commit()
