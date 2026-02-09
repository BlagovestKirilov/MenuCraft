package bg.menucraft.controller;

import bg.menucraft.model.request.AccountRegistrationRequest;
import bg.menucraft.model.request.LoginRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/auth")
@RestController
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(authService.login(loginRequest, httpServletRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody AccountRegistrationRequest registrationRequest, HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(authService.register(registrationRequest, httpServletRequest));
    }
}
