package bg.menucraft.service;

import bg.menucraft.config.OpenAiProperties;
import bg.menucraft.model.ai.ItemLayout;
import bg.menucraft.model.ai.MenuLayoutResponse;
import bg.menucraft.model.ai.SectionLayout;
import bg.menucraft.model.ai.SectionRegion;
import bg.menucraft.model.dto.MealDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Log4j2
@Service
public class MenuLayoutService {

    private static final Map<String, String> SECTION_TITLES_BG = new LinkedHashMap<>() {{
        put("SALAD", "САЛАТИ");
        put("SOUP", "СУПИ");
        put("MAIN_COURSE", "ОСНОВНИ ЯСТИЯ");
        put("DESSERT", "ДЕСЕРТИ");
    }};

    private static final String SYSTEM_PROMPT = """
            You are a precise restaurant menu layout engine. Your task is to calculate optimal \
            text positions for menu items within predefined section regions on a PDF template.
            If a template image is provided, use it to understand the design and place text \
            in regions that complement the template's visual layout — avoid overlapping decorative \
            elements, headers, or borders visible in the image.

            COORDINATE SYSTEM:
            - Units are PDF points (1 point = 1/72 inch)
            - Y axis: 0 = bottom of page, increases upward
            - Items within a section must be ordered from top (highest Y) to bottom (lowest Y)

            SECTION TITLES:
            Each section MUST have a Bulgarian title:
            - SALAD → "САЛАТИ"
            - SOUP → "СУПИ"
            - MAIN_COURSE → "ОСНОВНИ ЯСТИЯ"
            - DESSERT → "ДЕСЕРТИ"
            The title is placed at the top of the section region. titleY should be near topY (with ~5pt padding).
            titleFontSize should be fontSize + 4 (bold heading, larger than items).

            LAYOUT RULES:
            1. Reserve space for the title at the top of each section before distributing items
            2. Distribute items evenly in the remaining space below the title
            3. Add equal padding at the top and bottom of each section (at least 5pt from the edges)
            4. Use a SINGLE GLOBAL fontSize for ALL sections — every section must share the same fontSize.
               Choose based on the section with the most items and available space:
               - 1-2 items: 14-16pt
               - 3-4 items: 12-14pt
               - 5-6 items: 10-12pt
               - 7+ items: 8-10pt
               - Never exceed 16pt, never go below 8pt
            5. Use the SAME vertical gap between consecutive items in ALL sections
            6. Ensure the gap between consecutive items is at least (fontSize + 4)pt
            7. If items cannot fit with minimum fontSize 8pt, use 8pt and pack them tightly

            TEXT FORMATTING:
            1. Capitalize the first letter of each word in item names
            2. Fix obvious spelling errors in item names
            3. Format prices exactly as "X.XX €" — preserve the original numeric value, do NOT change prices

            OUTPUT — return ONLY valid JSON in this exact structure:
            {
              "sections": [
                {
                  "type": "SALAD",
                  "title": "САЛАТИ",
                  "titleY": 470.0,
                  "titleFontSize": 16.0,
                  "fontSize": 12.0,
                  "items": [
                    { "name": "Caesar Salad", "price": "12.50 €", "y": 450.0 }
                  ]
                }
              ]
            }
            """;

    private final RestClient openAiClient;
    private final OpenAiProperties properties;
    private final ObjectMapper objectMapper;

    public MenuLayoutService(OpenAiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.openAiClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeader("Authorization", "Bearer " + properties.apiKey())
                .build();
    }

    /**
     * Calls the OpenAI API to calculate optimal layout positions for menu items.
     * Falls back to simple even distribution if the API call fails.
     *
     * @param templateImageBase64 optional base64-encoded PNG of the template page (for vision context)
     */
    public MenuLayoutResponse calculateLayout(float pageWidth, float pageHeight,
                                              Map<String, SectionRegion> regions,
                                              Map<String, List<MealDto>> itemsMap,
                                              String templateImageBase64) {
        try {
            String userPrompt = buildUserPrompt(pageWidth, pageHeight, regions, itemsMap);
            String aiResponse = callOpenAi(userPrompt, templateImageBase64);
            MenuLayoutResponse response = objectMapper.readValue(aiResponse, MenuLayoutResponse.class);
            log.info("AI layout calculated successfully for {} section(s)", response.sections().size());
            return response;
        } catch (Exception e) {
            log.warn("AI layout calculation failed, falling back to even distribution: {}", e.getMessage());
            return fallbackLayout(regions, itemsMap);
        }
    }

    private String buildUserPrompt(float pageWidth, float pageHeight,
                                   Map<String, SectionRegion> regions,
                                   Map<String, List<MealDto>> itemsMap) {
        StringBuilder sb = new StringBuilder();
        sb.append("Template page: %.1fpt × %.1fpt\n\n".formatted(pageWidth, pageHeight));
        sb.append("Sections:\n");

        for (var entry : regions.entrySet()) {
            String type = entry.getKey();
            SectionRegion r = entry.getValue();
            List<MealDto> items = itemsMap.getOrDefault(type, List.of());

            sb.append("- %s region: topY=%.1f, bottomY=%.1f, nameX=%.1f, priceX=%.1f, nameWidth=%.1f, priceWidth=%.1f\n"
                    .formatted(type, r.topY(), r.bottomY(), r.nameX(), r.priceX(), r.nameWidth(), r.priceWidth()));
            sb.append("  Items (%d):\n".formatted(items.size()));
            for (MealDto meal : items) {
                sb.append("    - \"%s\" — %s\n".formatted(meal.getName(), meal.getPrice().toPlainString()));
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    private String callOpenAi(String userPrompt, String templateImageBase64) {
        List<Map<String, Object>> userContent = new ArrayList<>();
        userContent.add(Map.of("type", "text", "text", userPrompt));

        if (templateImageBase64 != null && !templateImageBase64.isBlank()) {
            userContent.add(Map.of(
                    "type", "image_url",
                    "image_url", Map.of("url", "data:image/png;base64," + templateImageBase64, "detail", "low")
            ));
        }

        Map<String, Object> requestBody = Map.of(
                "model", properties.model(),
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", userContent)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.1
        );

        String response = openAiClient.post()
                .uri("/v1/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI response", e);
        }
    }

    /**
     * Simple fallback: evenly distribute items within each section
     * using basic math when the AI is unavailable.
     */
    private MenuLayoutResponse fallbackLayout(Map<String, SectionRegion> regions,
                                              Map<String, List<MealDto>> itemsMap) {
        // Determine a single global fontSize based on the largest section
        int maxItems = itemsMap.values().stream()
                .filter(l -> l != null && !l.isEmpty())
                .mapToInt(List::size)
                .max().orElse(1);
        float fontSize = maxItems <= 2 ? 15 : maxItems <= 4 ? 13 : maxItems <= 6 ? 11 : 9;
        float titleFontSize = fontSize + 4;

        List<SectionLayout> sections = new ArrayList<>();

        for (var entry : regions.entrySet()) {
            String type = entry.getKey();
            SectionRegion r = entry.getValue();
            List<MealDto> meals = itemsMap.getOrDefault(type, List.of());
            if (meals.isEmpty()) continue;

            int count = meals.size();
            float padding = 5;

            String title = SECTION_TITLES_BG.getOrDefault(type, type);
            float titleY = r.topY() - padding - titleFontSize;
            float itemsStartY = titleY - titleFontSize - 8;

            float itemStep = count > 1
                    ? (itemsStartY - r.bottomY() - padding) / (count - 1)
                    : 0;

            List<ItemLayout> items = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                MealDto meal = meals.get(i);
                float y = itemsStartY - i * itemStep;
                items.add(new ItemLayout(
                        meal.getName(),
                        meal.getPrice().toPlainString() + " €",
                        y
                ));
            }
            sections.add(new SectionLayout(type, title, titleY, titleFontSize, fontSize, items));
        }

        return new MenuLayoutResponse(sections);
    }
}
