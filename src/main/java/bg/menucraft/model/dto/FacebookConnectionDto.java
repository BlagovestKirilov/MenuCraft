package bg.menucraft.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Read-only view of a FacebookConnection for API responses.
 * Never includes the encrypted token.
 */
@Getter
@Setter
@NoArgsConstructor
public class FacebookConnectionDto {
    private UUID id;
    private String pageId;
    private String pageName;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
