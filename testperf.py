from locust import HttpUser, TaskSet, task, constant

# Classe que define o conjunto de tarefas (ações) dos usuários
class UserBehavior(TaskSet):

    def on_start(self):
        # Autenticação usando application/x-www-form-urlencoded
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        # Corpo da requisição POST com client_id, client_secret, e grant_type
        data = {
            "client_id": "seu_client_id",
            "client_secret": "seu_client_secret",
            "grant_type": "client_credentials"
        }

        # Realiza o POST com a URL completa
        response = self.client.post(
            "http://api.sua-api-url.com/auth/token", 
            data=data, 
            headers=headers
        )

        # Armazena o token de acesso
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
