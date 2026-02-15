package bg.menucraft.model;

import bg.menucraft.enums.MealEnum;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
public class GeneratedMeal extends BaseEntity {
    private String name;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private MealEnum type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_menu_id")
    private GeneratedMenu generatedMenu;
}
