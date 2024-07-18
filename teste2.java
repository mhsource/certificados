import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;
import java.util.List;

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
}
