

import boto3

class AWSClient:
    def __init__(self, **config):
        self.config = config

    def get_client(self, service_name):
        try:
            client = boto3.client(service_name, **self.config)
            return client
        except Exception as e:
            raise ValueError(f"Serviço '{service_name}' não encontrado no Boto3.") from e

    def call(self, service_name, method_name, **params):
        client = self.get_client(service_name)
        method = getattr(client, method_name, None)
        if callable(method):
            return method(**params)
        else:
            raise AttributeError(f"Método '{method_name}' não existe no serviço '{service_name}'.")
