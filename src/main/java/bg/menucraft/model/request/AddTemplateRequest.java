package bg.menucraft.model.request;

import bg.menucraft.constant.ValidationConstants;
import bg.menucraft.model.dto.TemplateSectionDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AddTemplateRequest {

    @NotBlank(message = ValidationConstants.TEMPLATE_NAME_EMPTY)
    @Size(min = ValidationConstants.TEMPLATE_NAME_MIN, max = ValidationConstants.TEMPLATE_NAME_MAX, message = ValidationConstants.TEMPLATE_NAME_SIZE)
    private String name;

    @Size(max = ValidationConstants.DESCRIPTION_MAX, message = ValidationConstants.DESCRIPTION_SIZE)
    private String description;

    /**
     * Base64-encoded file content (e.g. PDF).
     */
    @NotBlank(message = ValidationConstants.TEMPLATE_FILE_REQUIRED)
    private String data;

    /**
     * Optional; e.g. "application/pdf". Defaults to application/pdf if not set.
     */
    @Size(max = 100)
    private String contentType;

    @Valid
    @NotNull
    private List<TemplateSectionDto> sections;

    @NotNull
    private List<String> venueNames;
}
