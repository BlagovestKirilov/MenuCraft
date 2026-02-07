package bg.menucraft.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Venue extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;

    private String email;

    private String phone;

    private String city;

    private String address;

    private String description;

    private Boolean active;

    @ManyToOne
    private Account account;
}
