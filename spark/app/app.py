import sys
import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import substring

def main():
    spark = SparkSession.builder \
        .appName("ReadTxtFileApp") \
        .config("spark.hadoop.fs.s3a.access.key", '') \
        .config("spark.hadoop.fs.s3a.secret.key", '') \
        .config("spark.hadoop.fs.s3a.endpoint", "s3.amazonaws.com") \
        .getOrCreate()

    try:
        # Ler o arquivo de texto do S3
        df = spark.read.text('s3a://testeairfmm/teste.txt')

        # Extrair as colunas 'cpf' e 'nome' com base nas posições
        df_parsed = df.select(
            substring('value', 1, 11).alias('cpf'),    # Posição 0 a 11 (1-based no Spark)
            substring('value', 12, 9).alias('nome')    # Posição 11 a 20 (1-based no Spark)
        )

        # Exibir as primeiras linhas do DataFrame processado
        df_parsed.show(truncate=False)

        # Contar o número total de linhas
        line_count = df_parsed.count()
        print(f"Número total de linhas: {line_count}")

        # Salvar o DataFrame como JSON no mesmo bucket S3
        # O caminho de saída pode ser ajustado conforme necessário
        df_parsed.write.mode('overwrite').json('s3a://testeairfmm/output_json/')

        print("Arquivo JSON salvo com sucesso no bucket S3.")

    except Exception as e:
        print(f"Erro durante o processamento do arquivo: {e}")
    finally:
        # Finalizar a sessão Spark
        spark.stop()

if __name__ == "__main__":
    main()
