package bg.menucraft.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class LoggingConstants {

    // Authentication
    public static final String LOGIN_SUCCESS = "User '{}' logged in successfully from IP {}";
    public static final String LOGIN_FAILED = "Login failed for username '{}'";
    public static final String REGISTER_SUCCESS = "Account '{}' registered with role {}";
    public static final String REGISTER_DUPLICATE = "Registration failed — username '{}' already exists";
    public static final String TOKEN_REFRESH_SUCCESS = "Token refreshed for user '{}'";
    public static final String TOKEN_REFRESH_FAILED = "Token refresh failed — invalid or expired refresh token";

    // Venue
    public static final String VENUES_FETCHED = "Fetched {} venues for user '{}'";
    public static final String VENUES_FETCHED_ADMIN = "Admin fetched all {} venues";
    public static final String VENUE_REGISTERED = "Venue '{}' registered and linked to accounts: {}";
    public static final String VENUE_NOT_FOUND = "Venue not found: {}";

    // Template
    public static final String TEMPLATE_ADDED = "Template '{}' added and linked to venues: {}";
    public static final String TEMPLATE_DUPLICATE = "Template creation failed — name '{}' already exists";
    public static final String TEMPLATES_FETCHED = "Fetched {} templates for venue '{}'";
    public static final String TEMPLATE_DOWNLOADED = "Template file downloaded: id={}";
    public static final String TEMPLATE_NOT_FOUND = "Template not found: {}";

    // Menu generation
    public static final String MENU_GENERATED = "Menu generated for venue '{}' using template '{}'";
    public static final String MENU_REGENERATED = "Menu regenerated for menuId={}";
    public static final String MENU_SAVED = "Menu generation saved for user '{}', venue '{}', template '{}'";
    public static final String MENU_NOT_FOUND = "Generated menu not found: {}";
    public static final String MENU_ACCESS_DENIED = "Access denied to menu {} for user '{}'";

    // History
    public static final String HISTORY_FETCHED = "Fetched {} history entries for user '{}'";
    public static final String HISTORY_FETCHED_ADMIN = "Admin fetched all {} history entries";

    // Facebook
    public static final String FACEBOOK_OAUTH_STARTED = "Facebook OAuth initiated for venue '{}'";
    public static final String FACEBOOK_OAUTH_COMPLETED = "Facebook OAuth completed for venue '{}': {} page(s) connected";
    public static final String FACEBOOK_OAUTH_INVALID_STATE = "Facebook OAuth callback with invalid state";
    public static final String FACEBOOK_POST_SUCCESS = "Posted to Facebook page '{}' ({}): postId={}";
    public static final String FACEBOOK_GRAPH_ERROR = "Facebook Graph API error for page '{}': status={}, body={}";
    public static final String FACEBOOK_TOKEN_EXPIRED = "Marked Facebook connection {} as DISCONNECTED due to token error";

    // Encryption
    public static final String ENCRYPTION_FAILED = "Token encryption failed";
    public static final String DECRYPTION_FAILED = "Token decryption failed";

    // Admin
    public static final String COMPANY_ACCOUNTS_FETCHED = "Fetched {} company accounts";

    // Global exception handler
    public static final String EXCEPTION_RESOURCE_NOT_FOUND = "Resource not found: {}";
    public static final String EXCEPTION_DUPLICATE_RESOURCE = "Duplicate resource: {}";
    public static final String EXCEPTION_ACCESS_DENIED = "Access denied: {}";
    public static final String EXCEPTION_AUTHENTICATION = "Authentication error: {}";
    public static final String EXCEPTION_FACEBOOK_API = "Facebook API error: {}";
    public static final String EXCEPTION_MENU_GENERATION = "Menu generation error: {}";
    public static final String EXCEPTION_VALIDATION = "Validation error: {}";
    public static final String EXCEPTION_DATA_INTEGRITY = "Data integrity violation: {}";
    public static final String EXCEPTION_UNHANDLED = "Unhandled exception: {}";

    // JWT filter
    public static final String JWT_PROCESSING_FAILED = "JWT processing failed for request {}: {}";
}
