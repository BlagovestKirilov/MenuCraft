package bg.menucraft.service;

import bg.menucraft.constant.ExceptionConstants;
import bg.menucraft.constant.LoggingConstants;
import bg.menucraft.exception.AccessDeniedException;
import bg.menucraft.exception.ResourceNotFoundException;
import bg.menucraft.enums.MealEnum;
import bg.menucraft.model.Account;
import bg.menucraft.model.GeneratedMenu;
import bg.menucraft.model.Template;
import bg.menucraft.model.Venue;
import bg.menucraft.model.dto.GeneratedMenuDto;
import bg.menucraft.model.dto.MealDto;
import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.model.response.HistoryResponse;
import bg.menucraft.repository.AccountRepository;
import bg.menucraft.repository.GeneratedMenuRepository;
import bg.menucraft.repository.TemplateRepository;
import bg.menucraft.repository.VenueRepository;
import bg.menucraft.util.GeneratedMenuMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Log4j2
@RequiredArgsConstructor
@Service
public class GeneratedMenuService {

    private final TemplateRepository templateRepository;
    private final GeneratedMenuRepository generatedMenuRepository;
    private final VenueRepository venueRepository;
    private final AccountRepository accountRepository;
    private final GeneratedMenuMapper generatedMenuMapper;
    private final AuthService authService;

    @Transactional
    public void saveMenuGeneration(MenuGenerationRequest menuGenerationRequest) {
        Template template = templateRepository
                .findByName(menuGenerationRequest.getTemplateName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(ExceptionConstants.TEMPLATE_NOT_FOUND, menuGenerationRequest.getTemplateName())));

        String username = authService.getUsername();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(ExceptionConstants.ACCOUNT_NOT_FOUND, username)));

        Venue venue = venueRepository.findByName(menuGenerationRequest.getVenueName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(ExceptionConstants.VENUE_NOT_FOUND, menuGenerationRequest.getVenueName())));

        GeneratedMenu menu = generatedMenuMapper.toEntity(menuGenerationRequest);
        menu.setTemplate(template);
        menu.setAccount(account);
        menu.setVenue(venue);
        menu.getMeals().forEach(meal -> meal.setGeneratedMenu(menu));

        generatedMenuRepository.save(menu);

        log.info(LoggingConstants.MENU_SAVED, username, menuGenerationRequest.getVenueName(), menuGenerationRequest.getTemplateName());
    }

    public HistoryResponse getHistory() {
        List<GeneratedMenu> menuList;

        if (authService.isAdmin()) {
            menuList = generatedMenuRepository.findAllByOrderByCreatedAtDesc();
            log.info(LoggingConstants.HISTORY_FETCHED_ADMIN, menuList.size());
        } else {
            String username = authService.getUsername();
            menuList = generatedMenuRepository.findByAccountUsernameOrderByCreatedAtDesc(username);
            log.info(LoggingConstants.HISTORY_FETCHED, menuList.size(), username);
        }

        List<GeneratedMenuDto> menus = menuList.stream()
                .map(m -> new GeneratedMenuDto(m.getId(), m.getTemplate().getName(), m.getVenue().getName(), m.getCreatedAt()))
                .toList();

        return new HistoryResponse(menus);
    }

    /**
     * Rebuilds a MenuGenerationRequest from a stored GeneratedMenu record,
     * so the PDF can be regenerated on the fly without storing binary data.
     */
    public MenuGenerationRequest buildRegenerationRequest(UUID menuId) {
        GeneratedMenu menu = generatedMenuRepository.findById(menuId)
                .orElseThrow(() -> {
                    log.warn(LoggingConstants.MENU_NOT_FOUND, menuId);
                    return new ResourceNotFoundException(
                            String.format(ExceptionConstants.GENERATED_MENU_NOT_FOUND, menuId));
                });

        if (!authService.isAdmin()) {
            String username = authService.getUsername();
            if (!menu.getAccount().getUsername().equals(username)) {
                log.warn(LoggingConstants.MENU_ACCESS_DENIED, menuId, username);
                throw new AccessDeniedException(ExceptionConstants.ACCESS_DENIED);
            }
        }

        MenuGenerationRequest request = new MenuGenerationRequest();
        request.setTemplateName(menu.getTemplate().getName());
        request.setVenueName(menu.getVenue().getName());

        request.setSalads(menu.getMeals().stream()
                .filter(m -> m.getType() == MealEnum.SALAD)
                .map(m -> {
                    MealDto dto = new MealDto();
                    dto.setName(m.getName());
                    dto.setPrice(m.getPrice());
                    return dto;
                })
                .toList());

        request.setSoups(menu.getMeals().stream()
                .filter(m -> m.getType() == MealEnum.SOUP)
                .map(m -> {
                    MealDto dto = new MealDto();
                    dto.setName(m.getName());
                    dto.setPrice(m.getPrice());
                    return dto;
                })
                .toList());

        request.setMainCourses(menu.getMeals().stream()
                .filter(m -> m.getType() == MealEnum.MAIN_COURSE)
                .map(m -> {
                    MealDto dto = new MealDto();
                    dto.setName(m.getName());
                    dto.setPrice(m.getPrice());
                    return dto;
                })
                .toList());

        return request;
    }
}
