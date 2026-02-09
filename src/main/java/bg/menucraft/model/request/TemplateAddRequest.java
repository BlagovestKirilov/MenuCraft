package bg.menucraft.model.request;

import bg.menucraft.constant.ValidationConstants;
import bg.menucraft.model.dto.TemplateSectionDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TemplateAddRequest {

    @NotBlank(message = ValidationConstants.TEMPLATE_NAME_EMPTY)
    @Size(min = ValidationConstants.TEMPLATE_NAME_MIN, max = ValidationConstants.TEMPLATE_NAME_MAX, message = ValidationConstants.TEMPLATE_NAME_SIZE)
    private String name;

    @Size(max = ValidationConstants.DESCRIPTION_MAX, message = ValidationConstants.DESCRIPTION_SIZE)
    private String description;

    /**
     * Base64-encoded file content (e.g. PDF).
     */
    @NotBlank(message = ValidationConstants.TEMPLATE_FILE_REQUIRED)
    private String fileBase64;

    /**
     * Optional; e.g. "application/pdf". Defaults to application/pdf if not set.
     */
    @Size(max = 100)
    private String contentType;

    @Valid
    private List<TemplateSectionDto> sections = new ArrayList<>();

    private List<String> venueNames = new ArrayList<>();
}
