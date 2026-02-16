package bg.menucraft.model.response;

import bg.menucraft.model.dto.TemplateDto;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TemplateResponse(
        List<TemplateDto> templates
) {
}
