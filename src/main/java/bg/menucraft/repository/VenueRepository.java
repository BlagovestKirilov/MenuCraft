package bg.menucraft.repository;

import bg.menucraft.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VenueRepository extends JpaRepository<Venue, UUID> {
    Optional<Venue> findByName(String name);

    List<Venue> findByNameIn(List<String> names);
}
