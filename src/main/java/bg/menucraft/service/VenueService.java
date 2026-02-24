package bg.menucraft.service;

import bg.menucraft.constant.ExceptionConstants;
import bg.menucraft.constant.LoggingConstants;
import bg.menucraft.exception.ResourceNotFoundException;
import bg.menucraft.model.Account;
import bg.menucraft.model.Venue;
import bg.menucraft.model.request.VenueRegistrationRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.model.response.VenueResponse;
import bg.menucraft.repository.AccountRepository;
import bg.menucraft.repository.VenueRepository;
import bg.menucraft.util.VenueMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Log4j2
@RequiredArgsConstructor
@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final AccountRepository accountRepository;
    private final VenueMapper venueMapper;
    private final AuthService authService;

    public VenueResponse getVenues() {
        if (authService.isAdmin()) {
            List<Venue> allVenues = venueRepository.findAll();
            log.info(LoggingConstants.VENUES_FETCHED_ADMIN, allVenues.size());
            return new VenueResponse(venueMapper.toDtoList(allVenues));
        }

        String username = authService.getUsername();

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(ExceptionConstants.ACCOUNT_NOT_FOUND, username)));

        List<Venue> venues = account.getVenues();
        log.info(LoggingConstants.VENUES_FETCHED, venues.size(), username);

        return new VenueResponse(venueMapper.toDtoList(venues));
    }

    @Transactional
    public ApiResponse register(VenueRegistrationRequest venueRegistrationRequest) {
        Venue venue = venueMapper.toEntity(venueRegistrationRequest);
        venueRepository.save(venue);

        for (String username : venueRegistrationRequest.getAccountUsernames()) {
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            String.format(ExceptionConstants.ACCOUNT_NOT_FOUND, username)));
            account.getVenues().add(venue);
            accountRepository.save(account);
        }

        log.info(LoggingConstants.VENUE_REGISTERED, venue.getName(), venueRegistrationRequest.getAccountUsernames());

        return ApiResponse.success();
    }
}
