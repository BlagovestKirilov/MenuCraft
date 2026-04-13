package bg.menucraft.model.request;

import bg.menucraft.constant.ValidationConstants;
import bg.menucraft.model.dto.MealDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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

    @Size(max = 20, message = ValidationConstants.SALADS_SIZE)
    @Valid
    private List<MealDto> salads;

    @Size(max = 20, message = ValidationConstants.SOUPS_SIZE)
    @Valid
    private List<MealDto> soups;

    @Size(max = 30, message = ValidationConstants.MAIN_COURSES_SIZE)
    @Valid
    private List<MealDto> mainCourses;

    @Size(max = 20, message = ValidationConstants.DESSERTS_SIZE)
    @Valid
    private List<MealDto> desserts;

    @NotBlank(message = ValidationConstants.VENUE_NAME_EMPTY)
    @Size(min = ValidationConstants.VENUE_NAME_MIN, max = ValidationConstants.VENUE_NAME_MAX,
            message = ValidationConstants.VENUE_NAME_SIZE)
    private String venueName;
}
