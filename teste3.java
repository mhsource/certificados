import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // Cria exemplo de dados de entrada
        User user = new User();
        user.setName("mateus");
        user.setConta(Arrays.asList(new Account(1), new Account(2)));

        // Usa o mapper para converter
        UserMapper mapper = UserMapper.INSTANCE;
        List<UserAccount> userAccounts = mapper.userToUserAccounts(user);

        // Imprime os resultados
        userAccounts.forEach(ua -> System.out.println("name: " + ua.getName() + ", idConta: " + ua.getIdConta()));
    }
}
