package bg.menucraft.controller;

import bg.menucraft.config.FacebookProperties;
import bg.menucraft.model.request.FacebookPostRequest;
import bg.menucraft.model.response.FacebookOAuthResponse;
import bg.menucraft.model.response.FacebookPostResponse;
import bg.menucraft.service.FacebookOAuthService;
import bg.menucraft.service.FacebookPostingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * REST controller for the Facebook Page integration.
 * <p>
 * Endpoints:
 * GET    /facebook/oauth/login?venueName=...       → Generate Facebook login URL
 * GET    /facebook/oauth/callback?code=...&state=.. → OAuth callback (from Facebook redirect)
 * POST   /facebook/post                            → Post to a connected Facebook Page
 * DELETE /facebook/connection/{connectionId}        → Disconnect a Facebook Page
 */
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/facebook")
@RestController
public class FacebookController {

    private final FacebookOAuthService facebookOAuthService;
    private final FacebookPostingService facebookPostingService;
    private final FacebookProperties facebookProperties;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ───────────────────── OAuth Endpoints ─────────────────────

    /**
     * Generates the Facebook OAuth login URL for a specific venue.
     * The frontend should redirect the user to this URL.
     *
     * @param venueName the venue name to connect
     * @return redirect URL
     */
    @GetMapping("/oauth/login")
    public ResponseEntity<String> getLoginUrl(@RequestParam String venueName) {
        String loginUrl = facebookOAuthService.generateLoginUrl(venueName);
        return ResponseEntity.ok(loginUrl);
    }

    /**
     * OAuth callback endpoint. Facebook redirects here after the user grants permissions.
     * Exchanges the code for tokens, fetches Pages, and stores encrypted tokens.
     * After processing, redirects the browser to the frontend callback page.
     *
     * @param code  the authorization code from Facebook
     * @param state the CSRF state parameter
     * @return a 302 redirect to the frontend
     */
    @GetMapping("/oauth/callback")
    public ResponseEntity<Void> oauthCallback(
            @RequestParam String code,
            @RequestParam String state) {

        FacebookOAuthResponse response = facebookOAuthService.handleCallback(code, state);

        String frontendBase = frontendUrl + "/facebook/oauth/callback";
        String redirect = frontendBase
                + "?status=" + encode(response.status())
                + "&pages=" + encode(String.valueOf(response.pages() != null ? response.pages().size() : 0));

        if (response.message() != null) {
            redirect += "&message=" + encode(response.message());
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirect))
                .build();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    // ───────────────────── Posting ─────────────────────

    /**
     * Posts content to a connected Facebook Page.
     * Provide a connectionId, message, and optionally a photoUrl.
     *
     * @param request the post request
     * @return the post ID or error
     */
    @PostMapping("/post")
    public ResponseEntity<FacebookPostResponse> post(@Valid @RequestBody FacebookPostRequest request) {
        FacebookPostResponse response = facebookPostingService.post(request);
        return ResponseEntity.ok(response);
    }

    // ───────────────────── Disconnect ─────────────────────

    /**
     * Disconnects a Facebook Page connection by marking it as DISCONNECTED
     * and clearing the stored token.
     *
     * @param connectionId the UUID of the connection to disconnect
     * @return 204 No Content on success
     */
    @DeleteMapping("/connection/{connectionId}")
    public ResponseEntity<Void> disconnect(@PathVariable UUID connectionId) {
        facebookOAuthService.disconnect(connectionId);
        return ResponseEntity.noContent().build();
    }

    // ───────────────────── Data Deletion Callback ─────────────────────

    /**
     * Facebook Data Deletion Request callback.
     * Facebook sends a signed_request when a user requests deletion of their data.
     * We verify the signature, log the request, and return a confirmation.
     *
     * @param signedRequest the signed_request parameter from Facebook
     * @return JSON with url and confirmation_code
     */
    @PostMapping("/data-deletion")
    public ResponseEntity<Map<String, Object>> dataDeletion(@RequestParam("signed_request") String signedRequest) {
        try {
            String[] parts = signedRequest.split("\\.", 2);
            if (parts.length != 2) {
                return ResponseEntity.badRequest().build();
            }

            String sig = parts[0];
            String payload = parts[1];

            // Verify HMAC-SHA256 signature
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(facebookProperties.appSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] actual = Base64.getUrlDecoder().decode(sig + "==");

            if (!MessageDigest.isEqual(expected, actual)) {
                log.warn("Facebook data-deletion: invalid signature");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Decode payload
            String json = new String(Base64.getUrlDecoder().decode(payload + "=="), StandardCharsets.UTF_8);
            JsonNode node = objectMapper.readTree(json);
            String userId = node.path("user_id").asText("");

            String confirmationCode = UUID.randomUUID().toString();
            log.info("Facebook data-deletion request: userId={}, confirmationCode={}", userId, confirmationCode);

            // Facebook connections are deleted when user disconnects.
            // For a full deletion request, the user can contact support.
            // Return confirmation per Facebook's requirements.
            return ResponseEntity.ok(Map.of(
                    "url", frontendUrl + "/privacy",
                    "confirmation_code", confirmationCode
            ));

        } catch (Exception e) {
            log.error("Facebook data-deletion callback failed", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
