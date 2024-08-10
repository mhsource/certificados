import redis
import json

class RedisTableReader:
    def __init__(self, redis_host='localhost', redis_port=6379, redis_db=0):
        self.redis_host = redis_host
        self.redis_port = redis_port
        self.redis_db = redis_db
        self.redis_client = redis.Redis(host=self.redis_host, port=self.redis_port, db=self.redis_db)

    def read_table_as_json(self, table_key):
        try:
            # Ler todos os dados da "tabela" (supondo que seja um hash)
            table_data = self.redis_client.hgetall(table_key)
            
            if not table_data:
                print(f"Nenhum dado encontrado para a chave: {table_key}")
                return None
            
            # Converter os dados de bytes para string e formar um dicionário
            decoded_data = {k.decode('utf-8'): v.decode('utf-8') for k, v in table_data.items()}
            
            # Converter o dicionário para JSON
            json_data = json.dumps(decoded_data, indent=4)
            
            # Imprimir o JSON
            print(json_data)
            
            return json_data
        except Exception as e:
            print(f"Ocorreu um erro ao ler a tabela: {str(e)}")
            return None

# Exemplo de uso
if __name__ == "__main__":
    redis_host = 'localhost'
    redis_port = 6379
    redis_db = 0
    table_key = 'sua_tabela'  # Substitua pela chave da sua tabela no Redis

    reader = RedisTableReader(redis_host, redis_port, redis_db)
    reader.read_table_as_json(table_key)
