package bg.menucraft.repository;

import bg.menucraft.enums.FacebookConnectionStatus;
import bg.menucraft.model.FacebookConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacebookConnectionRepository extends JpaRepository<FacebookConnection, UUID> {

    Optional<FacebookConnection> findByVenueIdAndPageId(UUID venueId, String pageId);

    List<FacebookConnection> findByVenueId(UUID venueId);

    List<FacebookConnection> findByVenueIdAndStatus(UUID venueId, FacebookConnectionStatus status);
}
