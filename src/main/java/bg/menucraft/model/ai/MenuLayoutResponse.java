package bg.menucraft.model.ai;

import java.util.List;

/**
 * AI-generated layout instructions for rendering menu items onto a PDF template.
 * Returned by the OpenAI API (or by the fallback calculator).
 */
public record MenuLayoutResponse(List<SectionLayout> sections) {
}
