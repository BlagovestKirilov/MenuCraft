package bg.menucraft.controller;

import bg.menucraft.model.Template;
import bg.menucraft.model.request.TemplateAddRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.service.TemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RequiredArgsConstructor
@RequestMapping("/admin")
@RestController
public class AdminController {

    private final TemplateService templateService;

    @PostMapping("/template")
    public ResponseEntity<ApiResponse> addTemplate(@Valid @RequestBody TemplateAddRequest request) {
        return ResponseEntity.ok(templateService.addTemplate(request));
    }

    @GetMapping("/template/{id}/file")
    public ResponseEntity<byte[]> downloadTemplateFile(@PathVariable UUID id) {
        Template template = templateService.getTemplateById(id);
        byte[] data = template.getData();
        if (data == null || data.length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = template.getContentType() != null ? template.getContentType() : "application/octet-stream";
        String filename = template.getName() != null ? template.getName().replaceAll("[^a-zA-Z0-9.-]", "_") + ".pdf" : "template.pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(data);
    }
}
