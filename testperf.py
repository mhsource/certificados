from locust import HttpUser, TaskSet, task, between, constant
import json

# Classe que define o conjunto de tarefas (ações) dos usuários
class UserBehavior(TaskSet):

    def on_start(self):
        # Autenticação (exemplo usando Bearer Token)
        response = self.client.post("http://api.sua-api-url.com/auth/login", json={
            "username": "seu_usuario",
            "password": "sua_senha"
        })
        self.token = response.json()["access_token"]

    @task
    def get_request(self):
        # Cabeçalho com autenticação Bearer
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        # Requisição GET à API com URL completa
        self.client.get("http://api.sua-api-url.com/api/seu-endpoint", headers=headers)


# Classe que simula o usuário HTTP
class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    # Define o intervalo constante entre cada tarefa (transação)
    wait_time = constant(1/300)  # Para atingir 300 TPS
