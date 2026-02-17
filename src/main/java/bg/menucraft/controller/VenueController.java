package bg.menucraft.controller;

import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.model.request.VenueRegistrationRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.model.response.HistoryResponse;
import bg.menucraft.model.response.MenuResponse;
import bg.menucraft.model.response.TemplateResponse;
import bg.menucraft.model.response.VenueResponse;
import bg.menucraft.service.FileGenerationService;
import bg.menucraft.service.GeneratedMenuService;
import bg.menucraft.service.TemplateService;
import bg.menucraft.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RequestMapping("/venue")
@RestController
public class VenueController {
    private final VenueService venueService;
    private final FileGenerationService fileGenerationService;
    private final TemplateService templateService;
    private final GeneratedMenuService generatedMenuService;

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
        return ResponseEntity.ok(fileGenerationService.generateMenu(menuGenerationRequest));
    }

    @GetMapping("/template")
    public ResponseEntity<TemplateResponse> getTemplates(@RequestParam String venueName) {
        return ResponseEntity.ok(templateService.getTemplates(venueName));
    }

    @GetMapping("/history")
    public ResponseEntity<HistoryResponse> getHistory() {
        return ResponseEntity.ok(generatedMenuService.getHistory());
    }

    @GetMapping("/history/{menuId}")
    public ResponseEntity<MenuResponse> getMenuDetail(@PathVariable UUID menuId) {
        MenuGenerationRequest request = generatedMenuService.buildRegenerationRequest(menuId);
        return ResponseEntity.ok(fileGenerationService.regenerateMenu(request));
    }
}
