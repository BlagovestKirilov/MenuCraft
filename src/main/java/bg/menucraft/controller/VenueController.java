package bg.menucraft.controller;

import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.model.request.VenueRegistrationRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.model.response.MenuResponse;
import bg.menucraft.model.response.TemplateResponse;
import bg.menucraft.model.response.VenueResponse;
import bg.menucraft.service.FileGenerationService;
import bg.menucraft.service.TemplateService;
import bg.menucraft.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<MenuResponse> generateMenu(@Valid @RequestBody MenuGenerationRequest menuGenerationRequest) {
        return ResponseEntity.ok(MenuResponse.success(
                fileGenerationService.generateMenu(menuGenerationRequest),
                "application/pdf",
                "menu-filled.pdf"));
    }

    @GetMapping("/template")
    public ResponseEntity<TemplateResponse> getTemplates(@RequestParam String venueName) {
        return ResponseEntity.ok(templateService.getTemplates(venueName));
    }
}
