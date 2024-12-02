{
    "family": "jupyter-notebook-task",
    "containerDefinitions": [
        {
            "name": "jupyter-notebook",
            "image": "jupyter/base-notebook:latest",
            "memory": 512,
            "cpu": 256,
            "portMappings": [
                {
                    "containerPort": 8888,
                    "hostPort": 8888,
                    "protocol": "tcp"
                }
            ],
            "command": [
                "start-notebook.sh",
                "--NotebookApp.token=''"
            ],
            "essential": true,
            "mountPoints": [
                {
                    "sourceVolume": "efs-notebooks",
                    "containerPath": "/home/jovyan/work"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/jupyter-notebook",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ],
    "volumes": [
        {
            "name": "efs-notebooks",
            "efsVolumeConfiguration": {
                "fileSystemId": "fs-12345678",
                "rootDirectory": "/notebooks",
                "transitEncryption": "ENABLED"
            }
        }
    ],
    "networkMode": "awsvpc",
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole"
}
