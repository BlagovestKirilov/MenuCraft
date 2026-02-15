package bg.menucraft.service;

import bg.menucraft.model.GeneratedMenu;
import bg.menucraft.model.Template;
import bg.menucraft.model.request.MenuGenerationRequest;
import bg.menucraft.repository.GeneratedMenuRepository;
import bg.menucraft.repository.TemplateRepository;
import bg.menucraft.util.GeneratedMenuMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class GeneratedMenuService {

    private final TemplateRepository templateRepository;
    private final GeneratedMenuRepository generatedMenuRepository;
    private final GeneratedMenuMapper generatedMenuMapper;

    @Transactional
    public void saveMenuGeneration(MenuGenerationRequest menuGenerationRequest) {

        Template template = templateRepository
                .findByName(menuGenerationRequest.getTemplateName())
                .orElseThrow(() ->
                        new RuntimeException("Template not found: " + menuGenerationRequest.getTemplateName()));

        GeneratedMenu menu = generatedMenuMapper.toEntity(menuGenerationRequest);

        menu.setTemplate(template);

        menu.getMeals().forEach(meal -> meal.setGeneratedMenu(menu));

        generatedMenuRepository.save(menu);
    }
}
