package bg.menucraft.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalized OpenAI configuration.
 * Bound from application.yml under the "openai" prefix.
 */
@ConfigurationProperties(prefix = "openai")
public record OpenAiProperties(
        String apiKey,
        String model,
        String baseUrl
) {
}
