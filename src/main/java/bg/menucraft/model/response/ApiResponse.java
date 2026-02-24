package bg.menucraft.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse(
        String status,
        String message,
        String token,
        String refreshToken,
        String role
) {

    public static ApiResponse success(String role, String token, String refreshToken) {
        return new ApiResponse("SUCCESS", null, token, refreshToken, role);
    }

    public static ApiResponse success() {
        return new ApiResponse("SUCCESS", null, null, null, null);
    }

    public static ApiResponse error(String message) {
        return new ApiResponse("ERROR", message, null, null, null);
    }
}

