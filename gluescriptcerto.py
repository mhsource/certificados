import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from pyspark.sql.functions import current_date, date_format
from awsglue.context import GlueContext
from awsglue.job import Job

# Obter parâmetros
args = getResolvedOptions(sys.argv, ['JOB_NAME'])

# Inicializar o contexto do Glue
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Detalhes de conexão com o MySQL
mysql_url = "jdbc:mysql://seu_host_mysql:3306/seu_banco_de_dados"
mysql_usuario = "seu_usuario"
mysql_senha = "sua_senha"
mysql_consulta = "(SELECT * FROM sua_tabela) AS tmp"  # Substitua pela sua consulta

# Ler dados do MySQL
df = spark.read.format("jdbc") \
    .option("url", mysql_url) \
    .option("driver", "com.mysql.jdbc.Driver") \
    .option("dbtable", mysql_consulta) \
    .option("user", mysql_usuario) \
    .option("password", mysql_senha) \
    .load()

# Adicionar a coluna 'anomesdia' com a data atual no formato 'yyyyMMdd'
df = df.withColumn('anomesdia', date_format(current_date(), 'yyyyMMdd'))

# Converter DataFrame para DynamicFrame
from awsglue.dynamicframe import DynamicFrame
dyf = DynamicFrame.fromDF(df, glueContext, "dyf")

# Caminho de saída no S3
caminho_saida = "s3://seu-bucket/caminho/para/saida/"

# Escrever dados no S3 com particionamento em 'anomesdia'
glueContext.write_dynamic_frame.from_options(
    frame=dyf,
    connection_type="s3",
    connection_options={
        "path": caminho_saida,
        "partitionKeys": ["anomesdia"]
    },
    format="parquet",
    format_options={
        "compression": "snappy"
    }
)

job.commit()
