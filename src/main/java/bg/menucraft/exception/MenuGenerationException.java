package bg.menucraft.exception;

public class MenuGenerationException extends RuntimeException {
    public MenuGenerationException(String message) {
        super(message);
    }

    public MenuGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
