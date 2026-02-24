package bg.menucraft.model.dto;

import java.time.Instant;
import java.util.UUID;

public record GeneratedMenuDto(
        UUID id,
        String templateName,
        String venueName,
        Instant createdAt
) {
}
