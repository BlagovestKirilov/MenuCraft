package bg.menucraft.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ExceptionConstants {

    // Authentication
    public static final String INVALID_CREDENTIALS = "Invalid username or password";
    public static final String USERNAME_ALREADY_EXISTS = "Username already exists: %s";
    public static final String INVALID_REFRESH_TOKEN = "Invalid or expired refresh token";
    public static final String ACCOUNT_NOT_FOUND = "Account not found: %s";

    // Venue
    public static final String VENUE_NOT_FOUND = "Venue not found: %s";

    // Template
    public static final String TEMPLATE_NOT_FOUND = "Template not found: %s";
    public static final String TEMPLATE_NAME_EXISTS = "A template with name '%s' already exists";
    public static final String TEMPLATE_NO_DATA = "Template has no data: %s";
    public static final String TEMPLATE_NO_ACROFORM = "PDF template has no fillable form fields";

    // Menu
    public static final String GENERATED_MENU_NOT_FOUND = "Generated menu not found: %s";
    public static final String ACCESS_DENIED = "You do not have permission to access this resource";

    // Facebook
    public static final String FACEBOOK_INVALID_OAUTH_STATE = "Invalid or expired OAuth state. Please restart the connection.";
    public static final String FACEBOOK_NO_ACCESS_TOKEN = "Facebook did not return an access token during code exchange";
    public static final String FACEBOOK_NO_LONG_LIVED_TOKEN = "Facebook did not return a long-lived token";
    public static final String FACEBOOK_NO_PAGE_DATA = "Facebook did not return page data";
    public static final String FACEBOOK_CONNECTION_NOT_FOUND = "Facebook connection not found: %s";
    public static final String FACEBOOK_CONNECTION_DISCONNECTED = "This Facebook connection is disconnected. Please reconnect via OAuth.";
    public static final String FACEBOOK_NO_POST_ID = "Facebook did not return a post ID";
    public static final String FACEBOOK_TOKEN_EXPIRED = "Facebook token is invalid or expired. Connection marked as disconnected. Please reconnect.";
    public static final String FACEBOOK_API_ERROR = "Facebook API error: %s";

    // Encryption
    public static final String ENCRYPTION_FAILED = "Failed to encrypt token";
    public static final String DECRYPTION_FAILED = "Failed to decrypt token";

    // Generic
    public static final String INTERNAL_SERVER_ERROR = "An unexpected error occurred. Please try again later.";
    public static final String VALIDATION_FAILED = "Validation failed";
}
