import io.awspring.cloud.sqs.annotation.SqsListener;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.GetQueueAttributesRequest;
import software.amazon.awssdk.services.sqs.model.GetQueueAttributesResponse;

@Service
public class SqsService {

    private final SqsClient sqsClient;

    public SqsService(SqsClient sqsClient) {
        this.sqsClient = sqsClient;
    }

    @SqsListener("minha-fila")
    public void listen(String message) {
        System.out.println("Mensagem recebida: " + message);

        // Lógica adicional para processar a mensagem
    }

    public int getMessageCount(String queueUrl) {
        GetQueueAttributesRequest request = GetQueueAttributesRequest.builder()
                .queueUrl(queueUrl)
                .attributeNames("ApproximateNumberOfMessages")
                .build();

        GetQueueAttributesResponse response = sqsClient.getQueueAttributes(request);
        String messageCount = response.attributes().get("ApproximateNumberOfMessages");

        return Integer.parseInt(messageCount);
    }
}
