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

# Exemplo de uso
if __name__ == "__main__":
    cluster_name = "my-ecs-cluster"
    service_name = "my-ecs-service"
    desired_count = 5  # Novo número desejado de tarefas

    increase_ecs_tasks(cluster_name, service_name, desired_count)
