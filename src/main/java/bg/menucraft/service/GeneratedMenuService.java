package bg.menucraft.service;

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
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

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
                .orElseThrow(() ->
                        new RuntimeException("Template not found: " + menuGenerationRequest.getTemplateName()));

        String username = authService.getUsername();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found: " + username));

        Venue venue = venueRepository.findByName(menuGenerationRequest.getVenueName())
                .orElseThrow(() -> new RuntimeException("Venue not found: " + menuGenerationRequest.getVenueName()));

        GeneratedMenu menu = generatedMenuMapper.toEntity(menuGenerationRequest);
        menu.setTemplate(template);
        menu.setAccount(account);
        menu.setVenue(venue);
        menu.getMeals().forEach(meal -> meal.setGeneratedMenu(menu));

        generatedMenuRepository.save(menu);
    }

    public HistoryResponse getHistory() {
        String username = authService.getUsername();

        List<GeneratedMenuDto> menus = generatedMenuRepository
                .findByAccountUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(m -> new GeneratedMenuDto(m.getId(), m.getTemplate().getName(), m.getVenue().getName(), m.getCreatedAt()))
                .toList();

        return new HistoryResponse(menus);
    }

    /**
     * Rebuilds a MenuGenerationRequest from a stored GeneratedMenu record,
     * so the PDF can be regenerated on the fly without storing binary data.
     */
    public MenuGenerationRequest buildRegenerationRequest(UUID menuId) {
        String username = authService.getUsername();

        GeneratedMenu menu = generatedMenuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Generated menu not found: " + menuId));

        if (!menu.getAccount().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
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
