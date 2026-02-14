package bg.menucraft.controller;

import bg.menucraft.model.dto.FacebookConnectionDto;
import bg.menucraft.model.request.FacebookPostRequest;
import bg.menucraft.model.response.FacebookOAuthResponse;
import bg.menucraft.model.response.FacebookPostResponse;
import bg.menucraft.repository.FacebookConnectionRepository;
import bg.menucraft.service.FacebookOAuthService;
import bg.menucraft.service.FacebookPostingService;
import bg.menucraft.util.FacebookConnectionMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for the Facebook Page integration.
 * <p>
 * Endpoints:
 * GET  /facebook/oauth/login?venueId=...         → Generate Facebook login URL
 * GET  /facebook/oauth/callback?code=...&state=.. → OAuth callback (from Facebook redirect)
 * GET  /facebook/connections/{venueId}            → List all connections for a venue
 * POST /facebook/post                            → Post to a connected Facebook Page
 */
@RequiredArgsConstructor
@RequestMapping("/facebook")
@RestController
public class FacebookController {

    private final FacebookOAuthService facebookOAuthService;
    private final FacebookPostingService facebookPostingService;
    private final FacebookConnectionRepository facebookConnectionRepository;
    private final FacebookConnectionMapper facebookConnectionMapper;

    // ───────────────────── OAuth Endpoints ─────────────────────

    /**
     * Generates the Facebook OAuth login URL for a specific venue.
     * The frontend should redirect the user to this URL.
     *
     * @param venueId the venue to connect
     * @return redirect URL or JSON with the URL
     */
    @GetMapping("/oauth/login")
    public ResponseEntity<String> getLoginUrl(@RequestParam UUID venueId) {
        String loginUrl = facebookOAuthService.generateLoginUrl(venueId);
        return ResponseEntity.ok(loginUrl);
    }

    /**
     * OAuth callback endpoint. Facebook redirects here after the user grants permissions.
     * Exchanges the code for tokens, fetches Pages, and stores encrypted tokens.
     *
     * @param code  the authorization code from Facebook
     * @param state the CSRF state parameter
     * @return the list of connected Pages
     */
    @GetMapping("/oauth/callback")
    public ResponseEntity<FacebookOAuthResponse> oauthCallback(
            @RequestParam String code,
            @RequestParam String state) {

        FacebookOAuthResponse response = facebookOAuthService.handleCallback(code, state);
        return ResponseEntity.ok(response);
    }

    // ───────────────────── Connection Management ─────────────────────

    /**
     * Lists all Facebook connections for a given venue.
     *
     * @param venueId the venue UUID
     * @return list of connections (without tokens)
     */
    @GetMapping("/connections/{venueId}")
    public ResponseEntity<List<FacebookConnectionDto>> getConnections(@PathVariable UUID venueId) {
        List<FacebookConnectionDto> connections = facebookConnectionRepository.findByVenueId(venueId)
                .stream()
                .map(facebookConnectionMapper::toDto)
                .toList();
        return ResponseEntity.ok(connections);
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
}
