package bg.menucraft.service;

import bg.menucraft.constant.Constants;
import bg.menucraft.model.Account;
import bg.menucraft.model.Venue;
import bg.menucraft.model.request.VenueRegistrationRequest;
import bg.menucraft.model.response.AuthResponse;
import bg.menucraft.repository.AccountRepository;
import bg.menucraft.repository.VenueRepository;
import bg.menucraft.util.VenueMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final AccountRepository accountRepository;
    private final VenueMapper venueMapper;

    @Transactional
    public AuthResponse register(VenueRegistrationRequest venueRegistrationRequest, HttpServletRequest httpServletRequest) {

        Account account = accountRepository.findByUsername(venueRegistrationRequest.getAccountUsername())
                .orElseThrow(() -> new RuntimeException(venueRegistrationRequest.getAccountUsername()));

        account.setIpAddress(httpServletRequest.getHeader(Constants.X_REAL_IP));
        accountRepository.save(account);

        Venue venue = venueMapper.toEntity(venueRegistrationRequest);
        venue.setAccount(account);
        venueRepository.save(venue);

        return AuthResponse.success();
    }
}
