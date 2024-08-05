
//go get github.com/aws/aws-sdk-go-v2
//go get github.com/aws/aws-sdk-go-v2/config
//go get github.com/aws/aws-sdk-go-v2/service/sqs

package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/sqs"
)

func main() {
    // Carregar a configuração AWS (credenciais e região) do ambiente ou ~/.aws/config
    cfg, err := config.LoadDefaultConfig(context.TODO())
    if err != nil {
        log.Fatalf("unable to load SDK config, %v", err)
    }

    // Criar um cliente SQS
    client := sqs.NewFromConfig(cfg)

    queueURL := "https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>"

    // Loop infinito para polling
    for {
        receiveMessages(client, queueURL)
        time.Sleep(5 * time.Second) // Intervalo entre as requisições de polling
    }
}

func receiveMessages(client *sqs.Client, queueURL string) {
    input := &sqs.ReceiveMessageInput{
        QueueUrl:            &queueURL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds:     20,
    }

    result, err := client.ReceiveMessage(context.TODO(), input)
    if err != nil {
        log.Printf("failed to receive messages, %v", err)
        return
    }

    for _, message := range result.Messages {
        fmt.Printf("Message received: %s\n", *message.Body)

        // Após processar a mensagem, delete-a da fila
        deleteInput := &sqs.DeleteMessageInput{
            QueueUrl:      &queueURL,
            ReceiptHandle: message.ReceiptHandle,
        }

        _, err := client.DeleteMessage(context.TODO(), deleteInput)
        if err != nil {
            log.Printf("failed to delete message, %v", err)
        }
    }
}
