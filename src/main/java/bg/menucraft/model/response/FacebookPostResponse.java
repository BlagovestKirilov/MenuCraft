package bg.menucraft.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Response returned after a successful Facebook post.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FacebookPostResponse(
        String status,
        String postId,
        String message
) {
    public static FacebookPostResponse success(String postId) {
        return new FacebookPostResponse("SUCCESS", postId, null);
    }

    public static FacebookPostResponse error(String message) {
        return new FacebookPostResponse("ERROR", null, message);
    }
}
