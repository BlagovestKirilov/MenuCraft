package bg.menucraft.controller;

import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.model.request.VenueRegistrationRequest;
import bg.menucraft.model.response.AuthResponse;
import bg.menucraft.service.FileGenerationService;
import bg.menucraft.service.VenueService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/venue")
@RestController
public class VenueController {
    private final VenueService venueService;
    private final FileGenerationService fileGenerationService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody VenueRegistrationRequest registrationRequest, HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(venueService.register(registrationRequest, httpServletRequest));
    }

    @GetMapping("/menu")
    public ResponseEntity<byte[]> generateMenu(@Valid @RequestBody MenuGenerationRequest menuGenerationRequest) {
        byte[] pdfBytes = fileGenerationService.generateMenu(menuGenerationRequest);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=menu-filled.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
