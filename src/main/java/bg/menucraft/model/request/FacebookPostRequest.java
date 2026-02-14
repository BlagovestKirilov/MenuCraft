package bg.menucraft.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Request body for posting to a Facebook Page.
 * Provide either text only, or text + photoUrl.
 */
@Getter
@Setter
@NoArgsConstructor
public class FacebookPostRequest {

    /**
     * The FacebookConnection ID (not the Facebook Page ID).
     */
    @NotNull(message = "Connection ID is required")
    private UUID connectionId;

    /**
     * The text/caption to post.
     */
    @NotBlank(message = "Message is required")
    private String message;

    /**
     * Optional: a publicly accessible image URL for photo posts.
     */
    private String photoUrl;
}
