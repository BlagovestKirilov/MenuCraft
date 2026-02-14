package bg.menucraft.model.response;

import bg.menucraft.model.dto.FacebookPageDto;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * Response returned after a successful Facebook OAuth callback.
 * Contains the list of Pages the user granted access to.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FacebookOAuthResponse(
        String status,
        String message,
        List<FacebookPageDto> pages
) {
    public static FacebookOAuthResponse success(List<FacebookPageDto> pages) {
        return new FacebookOAuthResponse("SUCCESS", null, pages);
    }

    public static FacebookOAuthResponse error(String message) {
        return new FacebookOAuthResponse("ERROR", message, null);
    }
}
