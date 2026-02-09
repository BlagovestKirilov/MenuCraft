package bg.menucraft.model.dto;

import bg.menucraft.enums.MealEnum;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TemplateSectionDto {

    @NotNull(message = "Section type is required")
    private MealEnum type;

    @NotNull(message = "Slot count is required")
    @Positive(message = "Slot count must be greater than 0")
    private Integer slotCount;
}
