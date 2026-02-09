package bg.menucraft.model;

import bg.menucraft.enums.MealEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class TemplateSection extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealEnum type;

    @Column(nullable = false)
    private Integer slotCount;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Template template;
}
