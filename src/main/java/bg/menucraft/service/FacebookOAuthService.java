package bg.menucraft.service;

import bg.menucraft.config.FacebookProperties;
import bg.menucraft.enums.FacebookConnectionStatus;
import bg.menucraft.model.FacebookConnection;
import bg.menucraft.model.Venue;
import bg.menucraft.model.dto.FacebookPageDto;
import bg.menucraft.model.response.FacebookOAuthResponse;
import bg.menucraft.repository.FacebookConnectionRepository;
import bg.menucraft.repository.VenueRepository;
import bg.menucraft.security.TokenEncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles the Facebook OAuth 2.0 Authorization Code flow:
 * 1. Generate the Facebook login URL with CSRF state.
 * 2. Handle the callback: exchange code → short-lived token → long-lived token → fetch Pages.
 * 3. Persist encrypted Page tokens as FacebookConnection entities.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class FacebookOAuthService {

    private static final String OAUTH_DIALOG = "https://www.facebook.com/v21.0/dialog/oauth";
    private static final String SCOPES = "pages_manage_posts,pages_read_engagement,pages_show_list";

    private final FacebookProperties facebookProperties;
    private final RestClient restClient;
    private final TokenEncryptionService tokenEncryptionService;
    private final FacebookConnectionRepository facebookConnectionRepository;
    private final VenueRepository venueRepository;

    /**
     * In-memory store for CSRF state tokens.
     * Maps state → venueId so the callback knows which venue to link.
     * In production with multiple instances, use Redis or a DB table instead.
     */
    private final Map<String, UUID> stateStore = new ConcurrentHashMap<>();

    // ───────────────────── 1. Generate Login URL ─────────────────────

    /**
     * Builds the Facebook OAuth login URL for the given venue.
     *
     * @param venueId the venue that wants to connect a Facebook Page
     * @return the full Facebook login URL the frontend should redirect to
     */
    public String generateLoginUrl(UUID venueId) {
        String state = generateState();
        stateStore.put(state, venueId);

        return OAUTH_DIALOG
                + "?client_id=" + encode(facebookProperties.appId())
                + "&redirect_uri=" + encode(facebookProperties.redirectUri())
                + "&scope=" + encode(SCOPES)
                + "&state=" + encode(state)
                + "&response_type=code";
    }

    // ───────────────────── 2. Handle Callback ─────────────────────

    /**
     * Processes the OAuth callback from Facebook.
     * Validates CSRF state, exchanges tokens, fetches Pages, and stores connections.
     *
     * @param code  the authorization code from Facebook
     * @param state the CSRF state parameter
     * @return response containing the connected Pages
     */
    @Transactional
    public FacebookOAuthResponse handleCallback(String code, String state) {
        // Validate CSRF state
        UUID venueId = stateStore.remove(state);
        if (venueId == null) {
            return FacebookOAuthResponse.error("Invalid or expired OAuth state. Please restart the connection.");
        }

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found: " + venueId));

        // Step 1: Exchange authorization code for short-lived user access token
        String shortLivedToken = exchangeCodeForToken(code);

        // Step 2: Exchange short-lived token for long-lived user token
        String longLivedToken = exchangeForLongLivedToken(shortLivedToken);

        // Step 3: Fetch user's Facebook Pages
        List<FacebookPageDto> pages = fetchAndStorePages(venue, longLivedToken);

        log.info("Facebook OAuth completed for venue '{}': {} page(s) connected", venue.getName(), pages.size());
        return FacebookOAuthResponse.success(pages);
    }

    // ───────────────────── Token Exchange ─────────────────────

    /**
     * Exchanges an authorization code for a short-lived user access token.
     */
    @SuppressWarnings("unchecked")
    private String exchangeCodeForToken(String code) {
        String url = facebookProperties.graphApiBase() + "/oauth/access_token"
                + "?client_id=" + encode(facebookProperties.appId())
                + "&client_secret=" + encode(facebookProperties.appSecret())
                + "&redirect_uri=" + encode(facebookProperties.redirectUri())
                + "&code=" + encode(code);

        Map<String, Object> response = restClient.get()
                .uri(URI.create(url))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("access_token")) {
            throw new RuntimeException("Facebook did not return an access token during code exchange");
        }
        return response.get("access_token").toString();
    }

    /**
     * Exchanges a short-lived user token for a long-lived user token (~60 days).
     */
    @SuppressWarnings("unchecked")
    private String exchangeForLongLivedToken(String shortLivedToken) {
        String url = facebookProperties.graphApiBase() + "/oauth/access_token"
                + "?grant_type=fb_exchange_token"
                + "&client_id=" + encode(facebookProperties.appId())
                + "&client_secret=" + encode(facebookProperties.appSecret())
                + "&fb_exchange_token=" + encode(shortLivedToken);

        Map<String, Object> response = restClient.get()
                .uri(URI.create(url))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("access_token")) {
            throw new RuntimeException("Facebook did not return a long-lived token");
        }
        return response.get("access_token").toString();
    }

    // ───────────────────── Fetch & Store Pages ─────────────────────

    /**
     * Calls /me/accounts to get Pages, then stores each Page's token encrypted.
     * If a connection already exists for a venue+page, it is updated (re-connected).
     */
    @SuppressWarnings("unchecked")
    private List<FacebookPageDto> fetchAndStorePages(Venue venue, String longLivedUserToken) {
        String url = facebookProperties.graphApiBase() + "/me/accounts"
                + "?access_token=" + encode(longLivedUserToken);

        Map<String, Object> response = restClient.get()
                .uri(URI.create(url))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("data")) {
            throw new RuntimeException("Facebook did not return page data from /me/accounts");
        }

        List<FacebookPageDto> result = new ArrayList<>();

        List<Map<String, Object>> pages = (List<Map<String, Object>>) response.get("data");
        for (Map<String, Object> pageNode : pages) {
            String pageId = pageNode.get("id").toString();
            String pageName = pageNode.get("name").toString();
            String pageAccessToken = pageNode.get("access_token").toString();

            // Upsert: update if already exists, create otherwise
            FacebookConnection connection = facebookConnectionRepository
                    .findByVenueIdAndPageId(venue.getId(), pageId)
                    .orElseGet(FacebookConnection::new);

            connection.setVenue(venue);
            connection.setPageId(pageId);
            connection.setPageName(pageName);
            connection.setEncryptedPageToken(tokenEncryptionService.encrypt(pageAccessToken));
            connection.setStatus(FacebookConnectionStatus.CONNECTED);

            facebookConnectionRepository.save(connection);

            FacebookPageDto dto = new FacebookPageDto();
            dto.setPageId(pageId);
            dto.setPageName(pageName);
            dto.setStatus(FacebookConnectionStatus.CONNECTED.name());
            result.add(dto);
        }

        return result;
    }

    // ───────────────────── Helpers ─────────────────────

    private String generateState() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
