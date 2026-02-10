package bg.menucraft.model.request;

import bg.menucraft.constant.ValidationConstants;
import bg.menucraft.model.dto.MealDto;
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
public class MenuGenerationRequest {

    @NotBlank(message = ValidationConstants.TEMPLATE_NAME_EMPTY)
    private String templateName;

    @NotNull(message = ValidationConstants.SALADS_REQUIRED)
    @Size(min = 1, max = 20, message = ValidationConstants.SALADS_SIZE)
    @Valid
    private List<MealDto> salads;

    @NotNull(message = ValidationConstants.SOUPS_REQUIRED)
    @Size(min = 1, max = 20, message = ValidationConstants.SOUPS_SIZE)
    @Valid
    private List<MealDto> soups;

    @NotNull(message = ValidationConstants.MAIN_COURSES_REQUIRED)
    @Size(min = 1, max = 30, message = ValidationConstants.MAIN_COURSES_SIZE)
    @Valid
    private List<MealDto> mainCourses;
}
