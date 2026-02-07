package bg.menucraft.service;

import lombok.SneakyThrows;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@Service
public class FileGenerationService {

    @SneakyThrows
    public byte[] fillPdf() {

        ClassPathResource resource = new ClassPathResource("pdf/menu.pdf");

        try (InputStream is = resource.getInputStream();
             PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(is));
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PDAcroForm acroForm = document.getDocumentCatalog().getAcroForm();
            if (acroForm == null) {
                throw new IllegalStateException("PDF has no AcroForm");
            }

            acroForm.getField("appetizer1").setValue("Pizza Palace");
            acroForm.getField("appetizer2").setValue("Margherita");
            acroForm.getField("appetizer3").setValue("Pepperoni");

            acroForm.flatten();

            document.save(baos);

            return baos.toByteArray();
        }
    }
}
