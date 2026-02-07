package bg.menucraft.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ValidationConstants {
    public static final int USERNAME_MIN = 4;
    public static final int USERNAME_MAX = 20;
    public static final int PASSWORD_MIN = 5;
    public static final int PASSWORD_MAX = 50;

    public static final String ALPHANUMERIC_PATTERN = "^[A-Za-z0-9]+$";
    public static final String PASSWORD_PATTERN = "^[A-Za-z0-9!@#$%^&*(){}\\[\\]<>_+=\\-.,?|~`]+$";

    public static final String USERNAME_EMPTY = "Username cannot be empty";
    public static final String USERNAME_SIZE = "Username must be between " + USERNAME_MIN + " and " + USERNAME_MAX + " characters";
    public static final String USERNAME_PATTERN = "Username can contain only letters and digits";

    public static final String PASSWORD_EMPTY = "Password cannot be empty";
    public static final String PASSWORD_SIZE = "Password must be between " + PASSWORD_MIN + " and " + PASSWORD_MAX + " characters";
    public static final String PASSWORD_PATTERN_MSG = "Password can contain only letters, digits, and special symbols";

    public static final String ROLE_EMPTY = "Role cannot be empty";

    public static final String VENUE_NAME_EMPTY = "Venue name cannot be blank";
    public static final int VENUE_NAME_MIN = 2;
    public static final int VENUE_NAME_MAX = 100;
    public static final String VENUE_NAME_SIZE = "Venue name must be between {min} and {max} characters";

    public static final String EMAIL_EMPTY = "Email cannot be blank";
    public static final String EMAIL_INVALID = "Email is not valid";

    public static final String PHONE_EMPTY = "Phone number cannot be blank";
    public static final int PHONE_MIN = 6;
    public static final int PHONE_MAX = 20;
    public static final String PHONE_SIZE = "Phone number must be between {min} and {max} characters";

    public static final String CITY_EMPTY = "City cannot be blank";
    public static final String ADDRESS_EMPTY = "Address cannot be blank";

    public static final int DESCRIPTION_MAX = 500;
    public static final String DESCRIPTION_SIZE = "Description can be at most {max} characters";
}
