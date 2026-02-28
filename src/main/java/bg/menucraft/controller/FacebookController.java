package bg.menucraft.controller;

import bg.menucraft.model.request.FacebookPostRequest;
import bg.menucraft.model.response.FacebookOAuthResponse;
import bg.menucraft.model.response.FacebookPostResponse;
import bg.menucraft.service.FacebookOAuthService;
import bg.menucraft.service.FacebookPostingService;
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

import java.util.UUID;

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
}
