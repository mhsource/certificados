import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // Cria exemplo de dados de entrada
        List<UserAccount> userAccounts = Arrays.asList(
            new UserAccount("mateus", 1),
            new UserAccount("mateus", 2)
        );

        // Usa o mapper para converter
        UserMapper mapper = UserMapper.INSTANCE;
        User user = mapper.userAccountsToUser(userAccounts);

        // Imprime os resultados
        System.out.println("name: " + user.getName());
        user.getConta().forEach(account -> System.out.println("idConta: " + account.getIdConta()));
    }
}
