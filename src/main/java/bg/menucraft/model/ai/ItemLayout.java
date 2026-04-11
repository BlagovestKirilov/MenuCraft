package bg.menucraft.model.ai;

/**
 * Layout position for a single menu item (name + price at a given Y coordinate).
 */
public record ItemLayout(
        String name,
        String price,
        float y
) {
}
