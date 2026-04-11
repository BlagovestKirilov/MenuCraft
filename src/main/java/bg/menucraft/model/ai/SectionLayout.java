package bg.menucraft.model.ai;

import java.util.List;

/**
 * Layout instructions for a single menu section (e.g. SALAD, SOUP).
 */
public record SectionLayout(
        String type,
        String title,
        float titleY,
        float titleFontSize,
        float fontSize,
        List<ItemLayout> items
) {
}
