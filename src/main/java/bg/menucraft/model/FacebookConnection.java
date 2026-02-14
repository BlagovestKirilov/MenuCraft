package bg.menucraft.model;

import bg.menucraft.enums.FacebookConnectionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a linked Facebook Page for a specific Venue.
 * The page access token is stored AES-encrypted; it is never exposed to the frontend.
 */
@Getter
@Setter
@Entity
public class FacebookConnection extends BaseEntity {

    /**
     * The owning venue that connected this Facebook Page.
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Venue venue;

    /**
     * Facebook Page ID (numeric string).
     */
    @Column(nullable = false)
    private String pageId;

    /**
     * Human-readable Facebook Page name.
     */
    @Column(nullable = false)
    private String pageName;

    /**
     * AES-encrypted Page Access Token. Never expose this to the client.
     */
    @Column(nullable = false, length = 1024)
    private String encryptedPageToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacebookConnectionStatus status;
}
