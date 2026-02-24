package bg.menucraft.security;

import bg.menucraft.config.EncryptionProperties;
import bg.menucraft.constant.ExceptionConstants;
import bg.menucraft.constant.LoggingConstants;
import bg.menucraft.exception.EncryptionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption/decryption for Facebook tokens.
 * Each encrypted value is prefixed with its random IV so it can be decrypted independently.
 * Output format: Base64( IV[12] || ciphertext || authTag[16] )
 */
@Log4j2
@RequiredArgsConstructor
@Service
public class TokenEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128; // bits

    private final EncryptionProperties encryptionProperties;

    /**
     * Encrypts the given plaintext token.
     *
     * @param plainToken the raw Facebook Page access token
     * @return Base64-encoded ciphertext (IV + encrypted data + auth tag)
     */
    public String encrypt(String plainToken) {
        try {
            SecretKeySpec keySpec = buildKey();
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] encrypted = cipher.doFinal(plainToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // Prepend IV to ciphertext
            byte[] combined = ByteBuffer.allocate(iv.length + encrypted.length)
                    .put(iv)
                    .put(encrypted)
                    .array();

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            log.error(LoggingConstants.ENCRYPTION_FAILED, e);
            throw new EncryptionException(ExceptionConstants.ENCRYPTION_FAILED, e);
        }
    }

    /**
     * Decrypts the given Base64-encoded ciphertext back to a plaintext token.
     *
     * @param encryptedToken Base64-encoded ciphertext
     * @return the original plaintext token
     */
    public String decrypt(String encryptedToken) {
        try {
            SecretKeySpec keySpec = buildKey();
            byte[] combined = Base64.getDecoder().decode(encryptedToken);

            ByteBuffer buffer = ByteBuffer.wrap(combined);
            byte[] iv = new byte[GCM_IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] decrypted = cipher.doFinal(ciphertext);
            return new String(decrypted, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error(LoggingConstants.DECRYPTION_FAILED, e);
            throw new EncryptionException(ExceptionConstants.DECRYPTION_FAILED, e);
        }
    }

    private SecretKeySpec buildKey() {
        byte[] keyBytes = encryptionProperties.aesSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        // Pad or truncate to 32 bytes for AES-256
        byte[] key = new byte[32];
        System.arraycopy(keyBytes, 0, key, 0, Math.min(keyBytes.length, 32));
        return new SecretKeySpec(key, "AES");
    }
}
