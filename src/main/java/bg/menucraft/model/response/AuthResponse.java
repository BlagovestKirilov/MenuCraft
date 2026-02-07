package bg.menucraft.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthResponse(
        String status,
        String message,
        String token,
        String refreshToken,
        String role
) {

    public static AuthResponse success(String role, String token, String refreshToken) {
        return new AuthResponse("SUCCESS", null, token, refreshToken, role);
    }

    public static AuthResponse success() {
        return new AuthResponse("SUCCESS", null, null, null, null);
    }
}

