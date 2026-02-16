package bg.menucraft.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MenuResponse(
        String status,
        String data,
        String contentType,
        String filename
) {
    public static MenuResponse success(String base64Data, String contentType, String filename) {
        return new MenuResponse("SUCCESS", base64Data, contentType, filename);
    }
}
