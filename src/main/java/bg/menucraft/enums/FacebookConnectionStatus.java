package bg.menucraft.enums;

/**
 * Represents the state of a Facebook Page connection.
 */
public enum FacebookConnectionStatus {
    /**
     * Token is valid and ready for posting.
     */
    CONNECTED,
    /**
     * Token has been revoked, expired, or is otherwise invalid.
     */
    DISCONNECTED
}
