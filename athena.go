package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/athena"
)

func main() {
    // Carregar a configuração AWS (credenciais e região) do ambiente ou ~/.aws/config
    cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-1"))
    if err != nil {
        log.Fatalf("unable to load SDK config, %v", err)
    }

    // Criar um cliente Athena
    athenaClient := athena.NewFromConfig(cfg)

    // Definir a consulta e as configurações
    query := "SELECT * FROM your_table LIMIT 10" // Substitua pela sua consulta
    database := "your_database" // Substitua pelo seu banco de dados

    // Enviar a consulta para o Athena
    queryExecutionID, err := startQueryExecution(athenaClient, query, database)
    if err != nil {
        log.Fatalf("failed to start query execution, %v", err)
    }

    // Esperar pela conclusão da consulta
    err = waitForQueryCompletion(athenaClient, queryExecutionID)
    if err != nil {
        log.Fatalf("query failed, %v", err)
    }

    // Obter os resultados da consulta
    result, err := getQueryResults(athenaClient, queryExecutionID)
    if err != nil {
        log.Fatalf("failed to get query results, %v", err)
    }

    // Converter os resultados para JSON
    outputJSON, err := json.MarshalIndent(result, "", "  ")
    if err != nil {
        log.Fatalf("failed to marshal result to JSON, %v", err)
    }

    fmt.Println(string(outputJSON))
}

func startQueryExecution(client *athena.Client, query string, database string) (string, error) {
    input := &athena.StartQueryExecutionInput{
        QueryString: aws.String(query),
        QueryExecutionContext: &athena.QueryExecutionContext{
            Database: aws.String(database),
        },
        ResultConfiguration: &athena.ResultConfiguration{
            OutputLocation: aws.String("s3://your-s3-bucket/athena-results/"), // Substitua pelo seu bucket S3
        },
    }

    result, err := client.StartQueryExecution(context.TODO(), input)
    if err != nil {
        return "", err
    }

    return *result.QueryExecutionId, nil
}

func waitForQueryCompletion(client *athena.Client, queryExecutionID string) error {
    for {
        input := &athena.GetQueryExecutionInput{
            QueryExecutionId: aws.String(queryExecutionID),
        }

        result, err := client.GetQueryExecution(context.TODO(), input)
        if err != nil {
            return err
        }

        status := result.QueryExecution.Status.State
        if status == athena.QueryExecutionStateSucceeded {
            return nil
        } else if status == athena.QueryExecutionStateFailed || status == athena.QueryExecutionStateCancelled {
            return fmt.Errorf("query failed with status: %s", status)
        }

        time.Sleep(5 * time.Second)
    }
}

func getQueryResults(client *athena.Client, queryExecutionID string) ([]map[string]string, error) {
    input := &athena.GetQueryResultsInput{
        QueryExecutionId: aws.String(queryExecutionID),
    }

    result, err := client.GetQueryResults(context.TODO(), input)
    if err != nil {
        return nil, err
    }

    var rows []map[string]string
    if len(result.ResultSet.Rows) > 0 {
        // Extrair cabeçalhos
        headers := result.ResultSet.ResultSetMetadata.ColumnInfo
        columnNames := make([]string, len(headers))
        for i, header := range headers {
            columnNames[i] = *header.Name
        }

        // Extrair linhas
        for _, row := range result.ResultSet.Rows[1:] { // Pular o cabeçalho
            rowData := make(map[string]string)
            for i, datum := range row.Data {
                rowData[columnNames[i]] = *datum.VarCharValue
            }
            rows = append(rows, rowData)
        }
    }

    return rows, nil
}
