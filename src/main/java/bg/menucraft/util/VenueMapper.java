package bg.menucraft.util;

import bg.menucraft.model.Venue;
import bg.menucraft.model.request.VenueRegistrationRequest;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    Venue toEntity(VenueRegistrationRequest request);

    @AfterMapping
    default void setDefaults(@MappingTarget Venue venue) {
        venue.setActive(true);
    }
}
