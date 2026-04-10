package bg.menucraft.model.ai;

/**
 * Represents the bounding region of a menu section on the PDF template,
 * either extracted from AcroForm field positions or auto-computed from page dimensions.
 *
 * @param type       section type (e.g. "SALAD", "SOUP", "MAIN_COURSE")
 * @param topY       highest Y coordinate (PDF points, Y=0 at bottom)
 * @param bottomY    lowest Y coordinate
 * @param nameX      X coordinate for item name column
 * @param priceX     X coordinate for price column
 * @param nameWidth  width of the name column
 * @param priceWidth width of the price column
 */
public record SectionRegion(
        String type,
        float topY,
        float bottomY,
        float nameX,
        float priceX,
        float nameWidth,
        float priceWidth
) {
}
