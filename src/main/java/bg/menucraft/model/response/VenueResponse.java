package bg.menucraft.model.response;

import bg.menucraft.model.dto.VenueDto;

import java.util.List;

public record VenueResponse(
        List<VenueDto> venues
) {
}
