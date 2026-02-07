package bg.menucraft.model;

import bg.menucraft.enums.RoleEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
public class Account extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    private RoleEnum role;

    private String ipAddress;

    private Boolean enabled;

    @OneToMany(mappedBy = "account")
    private List<Venue> venues;
}
