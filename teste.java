import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;
import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mappings({
        @Mapping(source = "user.name", target = "name"),
        @Mapping(source = "account.idConta", target = "idConta")
    })
    UserAccount userAndAccountToUserAccount(User user, Account account);

    default List<UserAccount> userToUserAccounts(User user) {
        return user.getConta().stream()
                   .map(account -> userAndAccountToUserAccount(user, account))
                   .collect(Collectors.toList());
    }

    @Mappings({
        @Mapping(source = "name", target = "name"),
        @Mapping(source = "idConta", target = "idConta")
    })
    Account userAccountToAccount(UserAccount userAccount);

    default User userAccountsToUser(List<UserAccount> userAccounts) {
        if (userAccounts == null || userAccounts.isEmpty()) {
            return null;
        }
        User user = new User();
        user.setName(userAccounts.get(0).getName());
        user.setConta(userAccounts.stream()
                                  .map(this::userAccountToAccount)
                                  .collect(Collectors.toList()));
        return user;
    }
}
