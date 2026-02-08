package bg.menucraft.service;

import bg.menucraft.model.dto.MealDto;
import bg.menucraft.model.request.MenuGenerationRequest;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class FileGenerationService {

    private static final int FONT_SIZE = 14;

    @SneakyThrows
    public byte[] generateMenu(MenuGenerationRequest menuGenerationRequest) {
        ClassPathResource pdfResource = new ClassPathResource("pdf/terasata.pdf");
        ClassPathResource fontResource = new ClassPathResource("fonts/arialbd.ttf");
        if (!fontResource.exists()) {
            fontResource = new ClassPathResource("fonts/arial.ttf");
        }

        try (InputStream pdfIs = pdfResource.getInputStream();
             PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(pdfIs));
             InputStream fontIs = fontResource.getInputStream();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PDAcroForm acroForm = document.getDocumentCatalog().getAcroForm();
            if (acroForm == null) throw new IllegalStateException("PDF has no AcroForm");

            // 1️⃣ Load font with full embed (no subset) - required for AcroForm appearance regeneration and Cyrillic
            PDType0Font unicodeFont = PDType0Font.load(document, fontIs, false);

            // 2️⃣ Add font to form default resources and get the name PDFBox will use (e.g. "F1")
            // Using add() embeds the font and returns the resource name; put("ArialMT", ...) does not
            // resolve correctly when PDFBox regenerates appearances, causing "font isn't embedded" and wrong glyphs
            PDResources resources = acroForm.getDefaultResources();
            if (resources == null) {
                resources = new PDResources();
                acroForm.setDefaultResources(resources);
            }
            COSName fontResourceName = resources.add(unicodeFont);

            // 3️⃣ Set default appearance using the font name from add() so content stream uses embedded font (bigger, bold)
            String daString = "/" + fontResourceName.getName() + " " + FONT_SIZE + " Tf 0 g";
            acroForm.setDefaultAppearance(daString);

            // 4️⃣ Fix fields BEFORE filling data
            for (PDField field : acroForm.getFieldTree()) {
                if (field instanceof PDTextField) {
                    // Remove existing appearance streams to force regeneration
                    field.getCOSObject().removeItem(COSName.AP);
                    field.getCOSObject().setString(COSName.DA, daString);

                    for (PDAnnotationWidget widget : field.getWidgets()) {
                        widget.getCOSObject().removeItem(COSName.AP);
                        widget.getCOSObject().setString(COSName.DA, daString);
                    }
                }
            }

            // 5️⃣ Fill Data (Cyrillic)
            fillMeals(acroForm, "salad", "saladPrice", menuGenerationRequest.getSalads());
            fillMeals(acroForm, "soup", "soupPrice", menuGenerationRequest.getSoups());
            fillMeals(acroForm, "meal", "mealPrice", menuGenerationRequest.getMainCourses());

            // 6️⃣ REFRESH Appearances before flattening
            // This is the step that actually uses the font to draw the Cyrillic text
            acroForm.setNeedAppearances(true);

            // 7️⃣ Flatten
            acroForm.flatten();

            document.save(baos);
            return baos.toByteArray();
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