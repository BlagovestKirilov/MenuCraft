package bg.menucraft.service;

import bg.menucraft.config.FacebookProperties;
import bg.menucraft.enums.FacebookConnectionStatus;
import bg.menucraft.model.FacebookConnection;
import bg.menucraft.model.request.FacebookPostRequest;
import bg.menucraft.model.response.FacebookPostResponse;
import bg.menucraft.repository.FacebookConnectionRepository;
import bg.menucraft.security.TokenEncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.Map;

/**
 * Handles posting content (text, photo URL, or direct image upload) to a connected
 * Facebook Page via the Graph API.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class FacebookPostingService {

    private final FacebookProperties facebookProperties;
    private final RestClient restClient;
    private final TokenEncryptionService tokenEncryptionService;
    private final FacebookConnectionRepository facebookConnectionRepository;

    /**
     * Posts to a Facebook Page.
     * Priority: base64Photo > photoUrl > text only.
     */
    @Transactional
    public FacebookPostResponse post(FacebookPostRequest request) {
        FacebookConnection connection = facebookConnectionRepository.findById(request.getConnectionId())
                .orElseThrow(() -> new RuntimeException("Facebook connection not found: " + request.getConnectionId()));

        if (connection.getStatus() != FacebookConnectionStatus.CONNECTED) {
            return FacebookPostResponse.error(
                    "This Facebook connection is disconnected. Please reconnect via OAuth.");
        }

        String pageToken = tokenEncryptionService.decrypt(connection.getEncryptedPageToken());

        try {
            String postId;
            if (request.getBase64Photo() != null && !request.getBase64Photo().isBlank()) {
                byte[] imageBytes = Base64.getDecoder().decode(request.getBase64Photo());
                postId = postPhotoData(connection.getPageId(), pageToken, request.getMessage(), imageBytes);
            } else if (request.getPhotoUrl() != null && !request.getPhotoUrl().isBlank()) {
                postId = postPhotoUrl(connection.getPageId(), pageToken, request.getMessage(), request.getPhotoUrl());
            } else {
                postId = postText(connection.getPageId(), pageToken, request.getMessage());
            }

            log.info("Posted to Facebook page '{}' ({}): postId={}", connection.getPageName(), connection.getPageId(), postId);
            return FacebookPostResponse.success(postId);

        } catch (HttpClientErrorException e) {
            return handleGraphApiError(connection, e);
        }
    }

    // ───────────────────── Graph API Calls ─────────────────────

    @SuppressWarnings("unchecked")
    private String postText(String pageId, String pageToken, String message) {
        String url = facebookProperties.graphApiBase() + "/" + pageId + "/feed";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("message", message);
        form.add("access_token", pageToken);

        Map<String, Object> response = restClient.post()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("id")) {
            throw new RuntimeException("Facebook did not return a post ID for text post");
        }
        return response.get("id").toString();
    }

    @SuppressWarnings("unchecked")
    private String postPhotoUrl(String pageId, String pageToken, String caption, String photoUrl) {
        String url = facebookProperties.graphApiBase() + "/" + pageId + "/photos";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("url", photoUrl);
        form.add("message", caption);
        form.add("access_token", pageToken);

        Map<String, Object> response = restClient.post()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("id")) {
            throw new RuntimeException("Facebook did not return a post ID for photo post");
        }
        return response.get("id").toString();
    }

    /**
     * Uploads image bytes directly to Facebook via multipart/form-data.
     */
    @SuppressWarnings("unchecked")
    private String postPhotoData(String pageId, String pageToken, String caption, byte[] imageData) {
        String url = facebookProperties.graphApiBase() + "/" + pageId + "/photos";

        ByteArrayResource imageResource = new ByteArrayResource(imageData) {
            @Override
            public String getFilename() {
                return "menu.png";
            }
        };

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("source", imageResource);
        parts.add("message", caption);
        parts.add("access_token", pageToken);

        Map<String, Object> response = restClient.post()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(parts)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("id")) {
            throw new RuntimeException("Facebook did not return a post ID for photo upload");
        }
        return response.get("id").toString();
    }

    // ───────────────────── Error Handling ─────────────────────

    private FacebookPostResponse handleGraphApiError(FacebookConnection connection, HttpClientErrorException e) {
        String body = e.getResponseBodyAsString();
        log.warn("Facebook Graph API error for page '{}': status={}, body={}",
                connection.getPageId(), e.getStatusCode(), body);

        if (body.contains("\"code\":190") || body.contains("OAuthException")) {
            connection.setStatus(FacebookConnectionStatus.DISCONNECTED);
            facebookConnectionRepository.save(connection);
            log.warn("Marked Facebook connection {} as DISCONNECTED due to token error", connection.getId());
            return FacebookPostResponse.error(
                    "Facebook token is invalid or expired. Connection marked as disconnected. Please reconnect.");
        }

        return FacebookPostResponse.error("Facebook API error: " + body);
    }
}
