package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"

    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/sqs"
)

// Define a estrutura do cabeçalho e do corpo da mensagem
type MessageHeader struct {
    Type string `json:"type"`
    ID   string `json:"id"`
}

type MessageBody struct {
    Content string `json:"content"`
}

// Define a estrutura completa da mensagem
type Message struct {
    Header MessageHeader `json:"header"`
    Body   MessageBody   `json:"body"`
}

func main() {
    // Carregar a configuração AWS (credenciais e região) do ambiente ou ~/.aws/config
    cfg, err := config.LoadDefaultConfig(context.TODO())
    if err != nil {
        log.Fatalf("unable to load SDK config, %v", err)
    }

    // Criar um cliente SQS
    client := sqs.NewFromConfig(cfg)

    queueURL := "https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>"

    // Criar o cabeçalho e corpo da mensagem
    header := MessageHeader{
        Type: "notification",
        ID:   "12345",
    }
    body := MessageBody{
        Content: "This is the body of the message",
    }
    message := Message{
        Header: header,
        Body:   body,
    }

    // Converter a mensagem para JSON
    messageBody, err := json.Marshal(message)
    if err != nil {
        log.Fatalf("failed to marshal message to JSON, %v", err)
    }

    // Enviar a mensagem
    sendMessage(client, queueURL, string(messageBody))
}

func sendMessage(client *sqs.Client, queueURL, messageBody string) {
    input := &sqs.SendMessageInput{
        QueueUrl:    &queueURL,
        MessageBody: aws.String(messageBody),
    }

    result, err := client.SendMessage(context.TODO(), input)
    if err != nil {
        log.Fatalf("failed to send message, %v", err)
    }

    fmt.Printf("Message sent, ID: %s\n", *result.MessageId)
}
