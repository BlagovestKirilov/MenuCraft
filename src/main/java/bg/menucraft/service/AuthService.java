package bg.menucraft.service;

import bg.menucraft.constant.Constants;
import bg.menucraft.model.Account;
import bg.menucraft.model.request.AccountRegistrationRequest;
import bg.menucraft.model.request.LoginRequest;
import bg.menucraft.model.request.RefreshTokenRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.repository.AccountRepository;
import bg.menucraft.security.JwtService;
import bg.menucraft.util.AccountMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountMapper accountMapper;
    private final JwtService jwtService;

    @Transactional
    public ApiResponse login(LoginRequest loginRequest, HttpServletRequest httpServletRequest) {

        Account account = accountRepository.findByUsername(loginRequest.getUsername())
                .filter(foundUser -> passwordEncoder.matches(loginRequest.getPassword(), foundUser.getPassword()))
                .orElseThrow(() -> new RuntimeException(loginRequest.getUsername()));

        account.setIpAddress(httpServletRequest.getHeader(Constants.X_REAL_IP));
        accountRepository.save(account);

        return ApiResponse.success(
                account.getRole().toString(),
                jwtService.generateToken(account),
                jwtService.generateRefreshToken(account));
    }

    @Transactional
    public ApiResponse register(AccountRegistrationRequest registrationRequest, HttpServletRequest httpServletRequest) {

        if (accountRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new RuntimeException(registrationRequest.getUsername());
        }

        Account account = accountMapper.toEntity(registrationRequest);
        account.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        account.setIpAddress(httpServletRequest.getHeader(Constants.X_REAL_IP));
        accountRepository.save(account);

        return ApiResponse.success();
    }

    public ApiResponse refresh(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();

        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String username = jwtService.extractUsername(refreshToken);
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return ApiResponse.success(
                account.getRole().toString(),
                jwtService.generateToken(account),
                jwtService.generateRefreshToken(account));
    }

    public String getUsername() {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
    }
}
