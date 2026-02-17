package bg.menucraft.repository;

import bg.menucraft.model.GeneratedMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GeneratedMenuRepository extends JpaRepository<GeneratedMenu, UUID> {
    List<GeneratedMenu> findByAccountUsernameOrderByCreatedAtDesc(String username);
}
