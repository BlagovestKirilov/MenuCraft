package bg.menucraft.service;

import bg.menucraft.constant.Constants;
import bg.menucraft.constant.ExceptionConstants;
import bg.menucraft.constant.LoggingConstants;
import bg.menucraft.exception.MenuGenerationException;
import bg.menucraft.exception.ResourceNotFoundException;
import bg.menucraft.model.Template;
import bg.menucraft.model.ai.MenuLayoutResponse;
import bg.menucraft.model.ai.SectionRegion;
import bg.menucraft.model.dto.MealDto;
import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.model.response.MenuResponse;
import bg.menucraft.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotation;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
@Service
public class FileGenerationService {

    private static final Map<String, String> FIELD_PREFIX_TO_TYPE = Map.of(
            "salad", "SALAD",
            "soup", "SOUP",
            "meal", "MAIN_COURSE"
    );

    private final TemplateRepository templateRepository;
    private final GeneratedMenuService generatedMenuService;
    private final MenuLayoutService menuLayoutService;

    /**
     * Generates a PDF menu and saves a history record.
     */
    @SneakyThrows
    public MenuResponse generateMenu(MenuGenerationRequest request) {
        byte[] templateData = loadTemplateData(request.getTemplateName());
        MenuResponse response = buildMenu(request, templateData);
        generatedMenuService.saveMenuGeneration(request);
        log.info(LoggingConstants.MENU_GENERATED, request.getVenueName(), request.getTemplateName());
        return response;
    }

    /**
     * Regenerates a PDF menu without saving a new history record.
     */
    @SneakyThrows
    public MenuResponse regenerateMenu(MenuGenerationRequest request) {
        byte[] templateData = loadTemplateData(request.getTemplateName());
        return buildMenu(request, templateData);
    }

    /**
     * Loads template data from the database.
     * Separated from buildMenu so the DB connection is released before the long AI call.
     */
    private byte[] loadTemplateData(String templateName) {
        Template template = templateRepository.findByName(templateName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(ExceptionConstants.TEMPLATE_NOT_FOUND, templateName)));

        byte[] data = template.getData();
        if (data == null || data.length == 0) {
            throw new MenuGenerationException(
                    String.format(ExceptionConstants.TEMPLATE_NO_DATA, templateName));
        }
        return data;
    }

    /**
     * Core PDF generation logic:
     * 1. Determine section regions (from AcroForm fields if present, otherwise auto-computed)
     * 2. Ask AI for optimal layout (positions + font sizes)
     * 3. Draw menu text at AI-calculated positions
     */
    @SneakyThrows
    private MenuResponse buildMenu(MenuGenerationRequest request, byte[] templateData) {
        ClassPathResource fontResource = new ClassPathResource("fonts/arialbd.ttf");
        if (!fontResource.exists()) {
            fontResource = new ClassPathResource("fonts/arial.ttf");
        }

        try (InputStream pdfIs = new ByteArrayInputStream(templateData);
             PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(pdfIs));
             InputStream fontIs = fontResource.getInputStream();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PDType0Font font = PDType0Font.load(document, fontIs, false);

            // 1. Build items map by section type
            Map<String, List<MealDto>> itemsMap = new LinkedHashMap<>();
            itemsMap.put("SALAD", request.getSalads() != null ? request.getSalads() : List.of());
            itemsMap.put("SOUP", request.getSoups() != null ? request.getSoups() : List.of());
            itemsMap.put("MAIN_COURSE", request.getMainCourses() != null ? request.getMainCourses() : List.of());

            // 2. Get page dimensions
            PDPage page = document.getPage(0);
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            // 3. Extract section regions from AcroForm if present, otherwise auto-compute
            PDAcroForm acroForm = document.getDocumentCatalog().getAcroForm();
            Map<String, SectionRegion> regions;
            if (acroForm != null && acroForm.getFieldTree().iterator().hasNext()) {
                regions = extractSectionRegions(acroForm);
                removeFormFields(document);
                log.info("Using AcroForm-based section regions");
            } else {
                regions = computeSectionRegions(page, itemsMap);
                log.info("No AcroForm found — using auto-computed section regions");
            }

            // 4. Calculate layout via AI (with fallback to even distribution)
            MenuLayoutResponse layout = menuLayoutService.calculateLayout(
                    pageWidth, pageHeight, regions, itemsMap);

            // 5. Draw menu items at calculated positions
            drawMenu(document, page, font, layout, regions);

            document.save(baos);

            byte[] pdfBytes = baos.toByteArray();
            byte[] previewImageBytes = renderFirstPageAsImage(pdfBytes);

            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String previewImage = previewImageBytes != null
                    ? Base64.getEncoder().encodeToString(previewImageBytes) : null;

            return MenuResponse.success(pdfBase64, Constants.APPLICATION_PDF, "menu-filled.pdf", previewImage);
        }
    }

    /**
     * Extracts section bounding regions from AcroForm field widget positions.
     * Scans fields like salad1, saladPrice1, soup1, soupPrice1, meal1, mealPrice1, etc.
     * and calculates the bounding box for each section.
     */
    private Map<String, SectionRegion> extractSectionRegions(PDAcroForm acroForm) {
        Map<String, List<PDRectangle>> nameRects = new LinkedHashMap<>();
        Map<String, List<PDRectangle>> priceRects = new LinkedHashMap<>();

        for (PDField field : acroForm.getFieldTree()) {
            String fieldName = field.getFullyQualifiedName();
            if (fieldName == null) continue;

            for (var prefixEntry : FIELD_PREFIX_TO_TYPE.entrySet()) {
                String prefix = prefixEntry.getKey();
                String type = prefixEntry.getValue();
                String pricePrefix = prefix + "Price";

                if (fieldName.matches(pricePrefix + "\\d+")) {
                    for (PDAnnotationWidget w : field.getWidgets()) {
                        PDRectangle rect = w.getRectangle();
                        if (rect != null) {
                            priceRects.computeIfAbsent(type, k -> new ArrayList<>()).add(rect);
                        }
                    }
                    break;
                } else if (fieldName.matches(prefix + "\\d+")) {
                    for (PDAnnotationWidget w : field.getWidgets()) {
                        PDRectangle rect = w.getRectangle();
                        if (rect != null) {
                            nameRects.computeIfAbsent(type, k -> new ArrayList<>()).add(rect);
                        }
                    }
                    break;
                }
            }
        }

        Map<String, SectionRegion> regions = new LinkedHashMap<>();
        for (String type : FIELD_PREFIX_TO_TYPE.values()) {
            List<PDRectangle> names = nameRects.getOrDefault(type, List.of());
            List<PDRectangle> prices = priceRects.getOrDefault(type, List.of());
            if (names.isEmpty()) continue;

            List<PDRectangle> all = new ArrayList<>(names);
            all.addAll(prices);

            float topY = (float) all.stream().mapToDouble(PDRectangle::getUpperRightY).max().orElse(0);
            float bottomY = (float) all.stream().mapToDouble(PDRectangle::getLowerLeftY).min().orElse(0);
            float nameX = (float) names.stream().mapToDouble(PDRectangle::getLowerLeftX).min().orElse(0);
            float nameWidth = (float) names.stream().mapToDouble(PDRectangle::getWidth).max().orElse(100);
            float priceX = prices.isEmpty()
                    ? nameX + nameWidth + 10
                    : (float) prices.stream().mapToDouble(PDRectangle::getLowerLeftX).min().orElse(nameX + nameWidth + 10);
            float priceWidth = prices.isEmpty()
                    ? 60
                    : (float) prices.stream().mapToDouble(PDRectangle::getWidth).max().orElse(60);

            regions.put(type, new SectionRegion(type, topY, bottomY, nameX, priceX, nameWidth, priceWidth));
            log.debug("Extracted region {}: topY={}, bottomY={}, nameX={}, priceX={}",
                    type, topY, bottomY, nameX, priceX);
        }

        return regions;
    }

    /**
     * Auto-computes section regions by dividing the page into equal vertical bands
     * based on which sections actually have items.
     */
    private Map<String, SectionRegion> computeSectionRegions(PDPage page,
                                                             Map<String, List<MealDto>> itemsMap) {
        PDRectangle mediaBox = page.getMediaBox();
        float pageWidth = mediaBox.getWidth();
        float pageHeight = mediaBox.getHeight();

        List<String> activeSections = itemsMap.entrySet().stream()
                .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
                .map(Map.Entry::getKey)
                .toList();

        if (activeSections.isEmpty()) return Map.of();

        float topMargin = pageHeight * 0.15f;
        float bottomMargin = pageHeight * 0.08f;
        float leftMargin = pageWidth * 0.08f;
        float sectionGap = 12f;

        float usableHeight = pageHeight - topMargin - bottomMargin;
        float usableWidth = pageWidth - leftMargin * 2;

        float nameX = leftMargin;
        float nameWidth = usableWidth * 0.65f;
        float priceX = nameX + nameWidth + 10;
        float priceWidth = usableWidth * 0.25f;

        int sectionCount = activeSections.size();
        float sectionHeight = (usableHeight - (sectionCount - 1) * sectionGap) / sectionCount;

        Map<String, SectionRegion> regions = new LinkedHashMap<>();
        for (int i = 0; i < sectionCount; i++) {
            String type = activeSections.get(i);
            float topY = pageHeight - topMargin - i * (sectionHeight + sectionGap);
            float bottomY = topY - sectionHeight;
            regions.put(type, new SectionRegion(type, topY, bottomY, nameX, priceX, nameWidth, priceWidth));
            log.debug("Computed region {}: topY={}, bottomY={}", type, topY, bottomY);
        }

        return regions;
    }

    /**
     * Removes form field widget annotations from every page,
     * preserving the background design that is part of the page content stream.
     */
    private void removeFormFields(PDDocument document) throws IOException {
        for (PDPage page : document.getPages()) {
            List<PDAnnotation> annotations = page.getAnnotations();
            annotations.removeIf(PDAnnotationWidget.class::isInstance);
        }
        document.getDocumentCatalog().getCOSObject().removeItem(COSName.getPDFName("AcroForm"));
    }

    /**
     * Draws menu items onto the PDF page at AI-calculated Y positions,
     * using nameX/priceX from the extracted section regions.
     */
    private void drawMenu(PDDocument document, PDPage page, PDType0Font font,
                          MenuLayoutResponse layout, Map<String, SectionRegion> regions) throws IOException {
        try (PDPageContentStream cs = new PDPageContentStream(
                document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

            for (MenuLayoutResponse.SectionLayout section : layout.sections()) {
                SectionRegion region = regions.get(section.type());
                if (region == null) continue;

                float fontSize = section.fontSize();

                // Draw section title
                if (section.title() != null && !section.title().isBlank()) {
                    cs.beginText();
                    cs.setFont(font, section.titleFontSize());
                    cs.newLineAtOffset(region.nameX(), section.titleY());
                    cs.showText(section.title());
                    cs.endText();
                }

                for (MenuLayoutResponse.ItemLayout item : section.items()) {
                    // Draw item name
                    cs.beginText();
                    cs.setFont(font, fontSize);
                    cs.newLineAtOffset(region.nameX(), item.y());
                    cs.showText(item.name());
                    cs.endText();

                    // Draw price
                    cs.beginText();
                    cs.setFont(font, fontSize);
                    cs.newLineAtOffset(region.priceX(), item.y());
                    cs.showText(item.price());
                    cs.endText();
                }
            }
        }
    }

    @SneakyThrows
    private byte[] renderFirstPageAsImage(byte[] pdfBytes) {
        try (InputStream is = new ByteArrayInputStream(pdfBytes);
             PDDocument doc = Loader.loadPDF(new RandomAccessReadBuffer(is));
             ByteArrayOutputStream imgOut = new ByteArrayOutputStream()) {

            PDFRenderer renderer = new PDFRenderer(doc);
            BufferedImage image = renderer.renderImageWithDPI(0, 150);
            ImageIO.write(image, "png", imgOut);
            return imgOut.toByteArray();
        }
    }
}
