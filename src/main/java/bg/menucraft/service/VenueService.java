package bg.menucraft.service;

import bg.menucraft.model.Account;
import bg.menucraft.model.Venue;
import bg.menucraft.model.request.VenueRegistrationRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.repository.AccountRepository;
import bg.menucraft.repository.VenueRepository;
import bg.menucraft.util.VenueMapper;
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
    public ApiResponse register(VenueRegistrationRequest venueRegistrationRequest) {
        Venue venue = venueMapper.toEntity(venueRegistrationRequest);
        venueRepository.save(venue);

        for (String username : venueRegistrationRequest.getAccountUsernames()) {
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Account not found: " + username));
            account.getVenues().add(venue);
            accountRepository.save(account);
        }

        return ApiResponse.success();
    }
}
