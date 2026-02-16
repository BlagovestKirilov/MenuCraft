package bg.menucraft.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

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

    @OneToMany
    @JoinTable(
            name = "venue_template",
            joinColumns = @JoinColumn(name = "venue_id"),
            inverseJoinColumns = @JoinColumn(name = "template_id")
    )
    private List<Template> templates;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FacebookConnection> facebookConnections;
}
