package bg.menucraft.controller;

import bg.menucraft.constant.Constants;
import bg.menucraft.constant.LoggingConstants;
import bg.menucraft.enums.RoleEnum;
import bg.menucraft.model.Account;
import bg.menucraft.model.Template;
import bg.menucraft.model.request.AccountRegistrationRequest;
import bg.menucraft.model.request.AddTemplateRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.repository.AccountRepository;
import bg.menucraft.service.AuthService;
import bg.menucraft.service.TemplateService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Log4j2
@RequiredArgsConstructor
@RequestMapping("/admin")
@RestController
public class AdminController {

    private final TemplateService templateService;
    private final AuthService authService;
    private final AccountRepository accountRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerAccount(@Valid @RequestBody AccountRegistrationRequest registrationRequest, HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(authService.register(registrationRequest, httpServletRequest));
    }

    @GetMapping("/accounts/company")
    public ResponseEntity<List<String>> getCompanyAccounts() {
        List<String> usernames = accountRepository.findByRole(RoleEnum.COMPANY)
                .stream()
                .map(Account::getUsername)
                .toList();
        log.info(LoggingConstants.COMPANY_ACCOUNTS_FETCHED, usernames.size());
        return ResponseEntity.ok(usernames);
    }

    @PostMapping("/template")
    public ResponseEntity<ApiResponse> addTemplate(@Valid @RequestBody AddTemplateRequest request) {
        return ResponseEntity.ok(templateService.addTemplate(request));
    }

    @GetMapping("/template/{id}/file")
    public ResponseEntity<byte[]> downloadTemplateFile(@PathVariable UUID id) {
        Template template = templateService.getTemplateById(id);
        byte[] data = template.getData();
        if (data == null || data.length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = template.getContentType() != null ? template.getContentType() : Constants.APPLICATION_OCTET_STREAM;
        String filename = template.getName() != null ? template.getName().replaceAll("[^a-zA-Z0-9.-]", "_") + Constants.TEMPLATE_FILE_EXTENSION : "template.pdf";
        log.info(LoggingConstants.TEMPLATE_DOWNLOADED, id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(data);
    }
}
