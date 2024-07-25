import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sfn.SfnAsyncClient;
import software.amazon.awssdk.services.sfn.model.StartExecutionRequest;
import software.amazon.awssdk.services.sfn.model.StartExecutionResponse;

import java.util.concurrent.CompletableFuture;

public class StartStepFunctionExecution {

    public static void main(String[] args) {
        // Cria o cliente assíncrono do Step Functions
        SfnAsyncClient sfnClient = SfnAsyncClient.builder()
                .region(Region.US_EAST_1) // Defina a região apropriada
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
                .build();

        // Define o ARN da state machine e o input para a execução
        String stateMachineArn = "arn:aws:states:us-east-1:123456789012:stateMachine:exampleStateMachine"; // Substitua pelo seu ARN
        String input = "{ \"key1\": \"value1\", \"key2\": \"value2\" }"; // Substitua pelo input apropriado

        // Cria a solicitação para iniciar a execução
        StartExecutionRequest startExecutionRequest = StartExecutionRequest.builder()
                .stateMachineArn(stateMachineArn)
                .input(input)
                .name("exampleExecutionName") // Nome da execução (opcional)
                .build();

        // Faz a solicitação assíncrona para iniciar a execução
        CompletableFuture<StartExecutionResponse> future = sfnClient.startExecution(startExecutionRequest);

        // Processa a resposta de forma assíncrona
        future.thenAccept(response -> {
            System.out.println("Execution ARN: " + response.executionArn());
            System.out.println("Start Date: " + response.startDate());
        }).exceptionally(throwable -> {
            // Trata exceções
            System.err.println("Falha ao iniciar a execução: " + throwable.getMessage());
            return null;
        }).join(); // Aguarda a conclusão da operação

        // Fecha o cliente
        sfnClient.close();
    }
}
