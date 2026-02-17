package bg.menucraft.service;

import bg.menucraft.model.Template;
import bg.menucraft.model.dto.MealDto;
import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.model.response.MenuResponse;
import bg.menucraft.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;

@RequiredArgsConstructor
@Service
public class FileGenerationService {

    private static final int FONT_SIZE = 14;
    private final TemplateRepository templateRepository;
    private final GeneratedMenuService generatedMenuService;

    /**
     * Generates a PDF menu and saves a history record.
     */
    @SneakyThrows
    public MenuResponse generateMenu(MenuGenerationRequest menuGenerationRequest) {
        MenuResponse response = buildMenu(menuGenerationRequest);
        generatedMenuService.saveMenuGeneration(menuGenerationRequest);
        return response;
    }

    /**
     * Regenerates a PDF menu without saving a new history record.
     */
    @SneakyThrows
    public MenuResponse regenerateMenu(MenuGenerationRequest menuGenerationRequest) {
        return buildMenu(menuGenerationRequest);
    }

    /**
     * Core PDF generation logic — builds the filled PDF and renders a preview image.
     */
    @SneakyThrows
    private MenuResponse buildMenu(MenuGenerationRequest menuGenerationRequest) {
        Template template = templateRepository.findByName(menuGenerationRequest.getTemplateName())
                .orElseThrow(() -> new RuntimeException("Template not found: " + menuGenerationRequest.getTemplateName()));

        byte[] templateData = template.getData();
        if (templateData == null || templateData.length == 0) {
            throw new IllegalStateException("Template has no data: " + menuGenerationRequest.getTemplateName());
        }

        ClassPathResource fontResource = new ClassPathResource("fonts/arialbd.ttf");
        if (!fontResource.exists()) {
            fontResource = new ClassPathResource("fonts/arial.ttf");
        }

        try (InputStream pdfIs = new ByteArrayInputStream(templateData);
             PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(pdfIs));
             InputStream fontIs = fontResource.getInputStream();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PDAcroForm acroForm = document.getDocumentCatalog().getAcroForm();
            if (acroForm == null) throw new IllegalStateException("PDF has no AcroForm");

            PDType0Font unicodeFont = PDType0Font.load(document, fontIs, false);

            PDResources resources = acroForm.getDefaultResources();
            if (resources == null) {
                resources = new PDResources();
                acroForm.setDefaultResources(resources);
            }
            COSName fontResourceName = resources.add(unicodeFont);

            String daString = "/" + fontResourceName.getName() + " " + FONT_SIZE + " Tf 0 g";
            acroForm.setDefaultAppearance(daString);

            for (PDField field : acroForm.getFieldTree()) {
                if (field instanceof PDTextField) {
                    field.getCOSObject().removeItem(COSName.AP);
                    field.getCOSObject().setString(COSName.DA, daString);

                    for (PDAnnotationWidget widget : field.getWidgets()) {
                        widget.getCOSObject().removeItem(COSName.AP);
                        widget.getCOSObject().setString(COSName.DA, daString);
                    }
                }
            }

            fillMeals(acroForm, "salad", "saladPrice", menuGenerationRequest.getSalads());
            fillMeals(acroForm, "soup", "soupPrice", menuGenerationRequest.getSoups());
            fillMeals(acroForm, "meal", "mealPrice", menuGenerationRequest.getMainCourses());

            acroForm.refreshAppearances();
            acroForm.flatten();
            document.save(baos);

            byte[] pdfBytes = baos.toByteArray();
            byte[] previewImageBytes = renderFirstPageAsImage(pdfBytes);

            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String previewImage = previewImageBytes != null ? Base64.getEncoder().encodeToString(previewImageBytes) : null;

            return MenuResponse.success(pdfBase64, "application/pdf", "menu-filled.pdf", previewImage);
        }
    }

    private byte[] renderFirstPageAsImage(byte[] pdfBytes) {
        try (InputStream is = new ByteArrayInputStream(pdfBytes);
             PDDocument doc = Loader.loadPDF(new RandomAccessReadBuffer(is));
             ByteArrayOutputStream imgOut = new ByteArrayOutputStream()) {

            PDFRenderer renderer = new PDFRenderer(doc);
            BufferedImage image = renderer.renderImageWithDPI(0, 150);
            ImageIO.write(image, "png", imgOut);
            return imgOut.toByteArray();

        } catch (IOException e) {
            return null;
        }
    }

    private void fillMeals(PDAcroForm acroForm, String namePrefix, String pricePrefix,
                           List<MealDto> meals) throws IOException {
        if (meals == null) return;
        for (int i = 1; i <= meals.size(); i++) {
            MealDto meal = meals.get(i - 1);
            setField(acroForm, namePrefix + i, meal.getName());
            setField(acroForm, pricePrefix + i, meal.getPrice().toPlainString() + " €");
        }
    }

    private void setField(PDAcroForm acroForm, String fieldName, String value) throws IOException {
        PDField field = acroForm.getField(fieldName);
        if (field != null) {
            field.setValue(value);
        }
    }
}
