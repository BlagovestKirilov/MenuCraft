package bg.menucraft.controller;

import bg.menucraft.model.dto.TemplateDto;
import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.model.request.VenueRegistrationRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.model.response.VenueResponse;
import bg.menucraft.service.FileGenerationService;
import bg.menucraft.service.TemplateService;
import bg.menucraft.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/venue")
@RestController
public class VenueController {
    private final VenueService venueService;
    private final FileGenerationService fileGenerationService;
    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<VenueResponse> getVenues() {
        return ResponseEntity.ok(venueService.getVenues());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody VenueRegistrationRequest registrationRequest) {
        return ResponseEntity.ok(venueService.register(registrationRequest));
    }

    @PostMapping("/menu")
    public ResponseEntity<byte[]> generateMenu(@Valid @RequestBody MenuGenerationRequest menuGenerationRequest) {
        byte[] pdfBytes = fileGenerationService.generateMenu(menuGenerationRequest);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=menu-filled.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/template")
    public ResponseEntity<List<TemplateDto>> getTemplates(@RequestParam String venueName) {
        return ResponseEntity.ok(templateService.getTemplates(venueName));
    }
}
