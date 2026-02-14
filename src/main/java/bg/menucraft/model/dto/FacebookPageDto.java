package bg.menucraft.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a Facebook Page returned after OAuth.
 * Does NOT contain the access token — that stays server-side only.
 */
@Getter
@Setter
@NoArgsConstructor
public class FacebookPageDto {
    private String pageId;
    private String pageName;
    private String status;
}
