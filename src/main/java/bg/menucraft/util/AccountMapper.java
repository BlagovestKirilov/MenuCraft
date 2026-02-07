package bg.menucraft.util;

import bg.menucraft.model.Account;
import bg.menucraft.model.request.AccountRegistrationRequest;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    Account toEntity(AccountRegistrationRequest request);

    @AfterMapping
    default void setDefaults(@MappingTarget Account account) {
        account.setEnabled(true);
    }
}
