# processor.py

import json
import logging
from aws_client import AWSClient

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Lista branca de serviços e métodos permitidos
ALLOWED_SERVICES = {
    's3': ['list_buckets', 'get_object', 'put_object'],
    'dynamodb': ['put_item', 'get_item', 'delete_item'],
    'lambda': ['invoke'],
    # Adicione outros serviços e métodos conforme necessário
}

def process_request(event):
    logger.info(f"Evento recebido: {event}")
    # Extrair informações da solicitação
    try:
        body = json.loads(event.get('body', '{}'))
        service_name = body.get('service_name')
        method_name = body.get('method_name')
        params = body.get('params', {})
    except Exception as e:
        logger.error(f"Erro ao analisar o corpo da solicitação: {e}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Erro ao analisar o corpo da solicitação.', 'details': str(e)})
        }

    # Validar parâmetros obrigatórios
    if not service_name or not method_name:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Parâmetros "service_name" e "method_name" são obrigatórios.'})
        }

    # Validar se o serviço e método são permitidos
    allowed_methods = ALLOWED_SERVICES.get(service_name)
    if not allowed_methods or method_name not in allowed_methods:
        return {
            'statusCode': 403,
            'body': json.dumps({'error': f'Acesso ao método "{method_name}" do serviço "{service_name}" não é permitido.'})
        }

    # Inicializar o cliente AWS
    aws_client = AWSClient(region_name='us-east-1')

    # Chamar o serviço AWS
    try:
        response = aws_client.call(service_name, method_name, **params)
        # Converter a resposta em JSON serializável
        response_body = json.loads(json.dumps(response, default=str))
        return {
            'statusCode': 200,
            'body': json.dumps({'success': True, 'data': response_body})
        }
    except Exception as e:
        logger.error(f"Erro ao chamar o serviço AWS: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Erro ao chamar o serviço AWS.', 'details': str(e)})
        }
