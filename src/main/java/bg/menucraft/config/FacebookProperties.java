package bg.menucraft.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalized Facebook OAuth configuration.
 * Bound from application.yml under the "facebook" prefix.
 */
@ConfigurationProperties(prefix = "facebook")
public record FacebookProperties(
        String appId,
        String appSecret,
        String redirectUri,
        String graphApiBase
) {
}
