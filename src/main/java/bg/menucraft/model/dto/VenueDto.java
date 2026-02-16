package bg.menucraft.model.dto;

import java.util.List;

public record VenueDto(
        String name,
        String email,
        String phone,
        String city,
        String address,
        String description,
        List<FacebookConnectionDto> facebookConnections
) {}
