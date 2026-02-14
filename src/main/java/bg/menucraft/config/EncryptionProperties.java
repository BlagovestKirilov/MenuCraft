package bg.menucraft.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalized encryption configuration.
 * The AES secret must be exactly 16, 24, or 32 characters for AES-128/192/256.
 */
@ConfigurationProperties(prefix = "encryption")
public record EncryptionProperties(
        String aesSecret
) {
}
