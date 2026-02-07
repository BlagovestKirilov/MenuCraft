package bg.menucraft.model.request;

import bg.menucraft.constant.ValidationConstants;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VenueRegistrationRequest {

    @NotBlank(message = ValidationConstants.VENUE_NAME_EMPTY)
    @Size(min = ValidationConstants.VENUE_NAME_MIN, max = ValidationConstants.VENUE_NAME_MAX, message = ValidationConstants.VENUE_NAME_SIZE)
    private String name;

    @NotBlank(message = ValidationConstants.EMAIL_EMPTY)
    @Email(message = ValidationConstants.EMAIL_INVALID)
    private String email;

    @NotBlank(message = ValidationConstants.PHONE_EMPTY)
    @Size(min = ValidationConstants.PHONE_MIN, max = ValidationConstants.PHONE_MAX, message = ValidationConstants.PHONE_SIZE)
    private String phone;

    @NotBlank(message = ValidationConstants.CITY_EMPTY)
    private String city;

    @NotBlank(message = ValidationConstants.ADDRESS_EMPTY)
    private String address;

    @Size(max = ValidationConstants.DESCRIPTION_MAX, message = ValidationConstants.DESCRIPTION_SIZE)
    private String description;

    @NotBlank(message = ValidationConstants.USERNAME_EMPTY)
    @Size(min = ValidationConstants.USERNAME_MIN, max = ValidationConstants.USERNAME_MAX, message = ValidationConstants.USERNAME_SIZE)
    @Pattern(regexp = ValidationConstants.ALPHANUMERIC_PATTERN, message = ValidationConstants.USERNAME_PATTERN)
    private String accountUsername;
}
