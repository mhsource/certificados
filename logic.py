import boto3
from botocore.exceptions import ClientError

def increase_ecs_tasks(cluster_name, service_name, desired_count):
    ecs_client = boto3.client('ecs')
    
    try:
        response = ecs_client.update_service(
            cluster=cluster_name,
            service=service_name,
            desiredCount=desired_count
        )
        print(f"Successfully updated the desired count to {desired_count} for service {service_name} in cluster {cluster_name}.")
        return response
    except ClientError as e:
        print(f"An error occurred: {e}")
        return None

import json
from src import logica

def lambda_handler(event, context):
    cluster_name = event.get('cluster_name')
    service_name = event.get('service_name')
    desired_count = event.get('desired_count')

    if not all([cluster_name, service_name, desired_count]):
        return {
            'statusCode': 400,
            'body': json.dumps('Error: Missing required parameters.')
        }
    
    try:
        desired_count = int(desired_count)
    except ValueError:
        return {
            'statusCode': 400,
            'body': json.dumps('Error: desired_count must be an integer.')
        }

    response = logica.increase_ecs_tasks(cluster_name, service_name, desired_count)

    if response is None:
        return {
            'statusCode': 500,
            'body': json.dumps('Error updating ECS service.')
        }

    return {
        'statusCode': 200,
        'body': json.dumps('Successfully updated ECS service.')
    }


import json
from lambda_function import lambda_handler

class Main:
    @staticmethod
    def simulate_lambda_execution():
        # Evento de exemplo que será passado para a função lambda_handler
        event = {
            'cluster_name': 'test-cluster',
            'service_name': 'test-service',
            'desired_count': 5
        }
        
        # Simulando o contexto da Lambda (pode ser um objeto vazio ou um mock)
        context = {}
        
        # Executando a função lambda_handler com o evento de exemplo e contexto
        response = lambda_handler(event, context)
        
        # Imprimindo a resposta da função Lambda
        print('Lambda Response:', response)

if __name__ == "__main__":
    Main.simulate_lambda_execution()


import pytest
from botocore.exceptions import ClientError
from src.logica import increase_ecs_tasks

@pytest.fixture
def ecs_client_mock(mocker):
    return mocker.patch('boto3.client')

def test_increase_ecs_tasks_success(ecs_client_mock):
    # Configurando o mock para retornar uma resposta bem-sucedida
    ecs_client_mock.return_value.update_service.return_value = {
        'service': {
            'desiredCount': 5
        }
    }

    response = increase_ecs_tasks('test-cluster', 'test-service', 5)
    
    assert response['service']['desiredCount'] == 5
    ecs_client_mock.return_value.update_service.assert_called_once_with(
        cluster='test-cluster',
        service='test-service',
        desiredCount=5
    )

def test_increase_ecs_tasks_client_error(ecs_client_mock):
    # Configurando o mock para levantar uma exceção ClientError
    ecs_client_mock.return_value.update_service.side_effect = ClientError(
        error_response={'Error': {'Code': 'ServiceException', 'Message': 'An error occurred'}},
        operation_name='UpdateService'
    )

    response = increase_ecs_tasks('test-cluster', 'test-service', 5)
    
    assert response is None
    ecs_client_mock.return_value.update_service.assert_called_once_with(
        cluster='test-cluster',
        service='test-service',
        desiredCount=5
    )




