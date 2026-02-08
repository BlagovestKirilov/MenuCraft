package bg.menucraft.model.dto;

import bg.menucraft.constant.ValidationConstants;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class MealDto {

    @NotBlank(message = ValidationConstants.MEAL_NAME_REQUIRED)
    @Size(max = 100, message = ValidationConstants.MEAL_NAME_SIZE)
    private String name;

    @NotNull(message = ValidationConstants.MEAL_PRICE_REQUIRED)
    @DecimalMin(value = "0.01", message = ValidationConstants.MEAL_PRICE_MIN)
    @Digits(integer = 6, fraction = 2, message = ValidationConstants.MEAL_PRICE_FORMAT)
    private BigDecimal price;
}
