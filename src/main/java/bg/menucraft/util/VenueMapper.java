package bg.menucraft.util;

import bg.menucraft.model.Venue;
import bg.menucraft.model.dto.VenueDto;
import bg.menucraft.model.request.VenueRegistrationRequest;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = FacebookConnectionMapper.class)
public interface VenueMapper {
    @Mapping(target = "templates", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "facebookConnections", ignore = true)
    Venue toEntity(VenueRegistrationRequest request);

    @AfterMapping
    default void setDefaults(@MappingTarget Venue venue) {
        venue.setActive(true);
    }

    VenueDto toDto(Venue venue);

    List<VenueDto> toDtoList(List<Venue> venues);
}
