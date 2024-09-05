import redis
import json

# Conectando ao Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Função para adicionar um cliente no Redis Hash 'tb_clientes'
def adicionar_cliente(cpf, cliente):
    # Cliente é um dicionário, então vamos convertê-lo em JSON
    cliente_json = json.dumps(cliente)
    # Adicionar cliente ao hash 'tb_clientes'
    r.hset('tb_clientes', cpf, cliente_json)

# Função para listar todos os clientes no hash 'tb_clientes'
def listar_clientes():
    # Obter todos os campos e valores do hash 'tb_clientes'
    clientes = r.hgetall('tb_clientes')
    # Converter valores de volta para dicionários Python
    return {cpf.decode('utf-8'): json.loads(dados.decode('utf-8')) for cpf, dados in clientes.items()}

# Função para buscar um cliente específico pelo CPF
def buscar_cliente(cpf):
    cliente_json = r.hget('tb_clientes', cpf)
    if cliente_json:
        return json.loads(cliente_json.decode('utf-8'))
    return None

# Função para remover um cliente do hash 'tb_clientes'
def remover_cliente(cpf):
    r.hdel('tb_clientes', cpf)

# Exemplo de uso:

# Adicionar clientes
cliente1 = {
    "nome": "João Silva",
    "email": "joao.silva@example.com",
    "telefone": "1234-5678"
}
cliente2 = {
    "nome": "Maria Oliveira",
    "email": "maria.oliveira@example.com",
    "telefone": "8765-4321"
}

# Adicionando clientes no hash 'tb_clientes'
adicionar_cliente("12345678900", cliente1)
adicionar_cliente("09876543211", cliente2)

# Listar todos os clientes
todos_clientes = listar_clientes()
print("Clientes armazenados no Redis:")
for cpf, dados in todos_clientes.items():
    print(f"CPF: {cpf}, Dados: {dados}")

# Buscar um cliente específico
cpf_busca = "12345678900"
cliente_encontrado = buscar_cliente(cpf_busca)
if cliente_encontrado:
    print(f"Cliente encontrado com CPF {cpf_busca}: {cliente_encontrado}")
else:
    print(f"Cliente com CPF {cpf_busca} não encontrado.")

# Remover um cliente
remover_cliente("09876543211")
print(f"Cliente com CPF 09876543211 removido.")

# Listar novamente após a remoção
todos_clientes = listar_clientes()
print("Clientes restantes após remoção:")
for cpf, dados in todos_clientes.items():
    print(f"CPF: {cpf}, Dados: {dados}")
