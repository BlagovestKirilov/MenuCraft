package bg.menucraft.service;

import bg.menucraft.constant.Constants;
import bg.menucraft.constant.ExceptionConstants;
import bg.menucraft.constant.LoggingConstants;
import bg.menucraft.exception.AuthenticationException;
import bg.menucraft.exception.DuplicateResourceException;
import bg.menucraft.exception.ResourceNotFoundException;
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
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Log4j2
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
                .orElseThrow(() -> {
                    log.warn(LoggingConstants.LOGIN_FAILED, loginRequest.getUsername());
                    return new AuthenticationException(ExceptionConstants.INVALID_CREDENTIALS);
                });

        account.setIpAddress(httpServletRequest.getHeader(Constants.X_REAL_IP));
        accountRepository.save(account);

        log.info(LoggingConstants.LOGIN_SUCCESS, account.getUsername(), account.getIpAddress());

        return ApiResponse.success(
                account.getRole().toString(),
                jwtService.generateToken(account),
                jwtService.generateRefreshToken(account));
    }

    @Transactional
    public ApiResponse register(AccountRegistrationRequest registrationRequest, HttpServletRequest httpServletRequest) {

        if (accountRepository.existsByUsername(registrationRequest.getUsername())) {
            log.warn(LoggingConstants.REGISTER_DUPLICATE, registrationRequest.getUsername());
            throw new DuplicateResourceException(
                    String.format(ExceptionConstants.USERNAME_ALREADY_EXISTS, registrationRequest.getUsername()));
        }

        Account account = accountMapper.toEntity(registrationRequest);
        account.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        account.setIpAddress(httpServletRequest.getHeader(Constants.X_REAL_IP));
        accountRepository.save(account);

        log.info(LoggingConstants.REGISTER_SUCCESS, account.getUsername(), account.getRole());

        return ApiResponse.success();
    }

    public ApiResponse refresh(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();

        if (!jwtService.isTokenValid(refreshToken)) {
            log.warn(LoggingConstants.TOKEN_REFRESH_FAILED);
            throw new AuthenticationException(ExceptionConstants.INVALID_REFRESH_TOKEN);
        }

        String username = jwtService.extractUsername(refreshToken);
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn(LoggingConstants.TOKEN_REFRESH_FAILED);
                    return new ResourceNotFoundException(
                            String.format(ExceptionConstants.ACCOUNT_NOT_FOUND, username));
                });

        log.info(LoggingConstants.TOKEN_REFRESH_SUCCESS, username);

        return ApiResponse.success(
                account.getRole().toString(),
                jwtService.generateToken(account),
                jwtService.generateRefreshToken(account));
    }

    public String getUsername() {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
    }

    public boolean isAdmin() {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Constants.ROLE_ADMIN));
    }
}
