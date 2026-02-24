package bg.menucraft.repository;

import bg.menucraft.enums.RoleEnum;
import bg.menucraft.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByUsername(String username);

    boolean existsByUsername(String username);

    List<Account> findByRole(RoleEnum role);
}
