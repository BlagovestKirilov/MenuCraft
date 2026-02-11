package bg.menucraft.service;

import bg.menucraft.model.Template;
import bg.menucraft.model.TemplateSection;
import bg.menucraft.model.Venue;
import bg.menucraft.model.dto.TemplateDto;
import bg.menucraft.model.request.AddTemplateRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.repository.TemplateRepository;
import bg.menucraft.repository.VenueRepository;
import bg.menucraft.util.TemplateMapper;
import bg.menucraft.util.TemplateSectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class TemplateService {

    private static final String DEFAULT_CONTENT_TYPE = "application/pdf";

    private final TemplateRepository templateRepository;
    private final VenueRepository venueRepository;
    private final TemplateMapper templateMapper;
    private final TemplateSectionMapper templateSectionMapper;

    @Transactional
    public ApiResponse addTemplate(AddTemplateRequest request) {
        Template template = templateMapper.toEntity(request);
        template.setData(Base64.getDecoder().decode(request.getData()));
        template.setContentType(request.getContentType() != null && !request.getContentType().isBlank()
                ? request.getContentType().trim()
                : DEFAULT_CONTENT_TYPE);

        // Create and add sections
        if (request.getSections() != null && !request.getSections().isEmpty()) {
            List<TemplateSection> sections = request.getSections().stream()
                    .map(sectionDto -> {
                        TemplateSection section = templateSectionMapper.toEntity(sectionDto);
                        section.setTemplate(template);
                        return section;
                    })
                    .toList();
            template.setSections(sections);
        }

        templateRepository.save(template);

        // Link venues if provided
        if (request.getVenueNames() != null && !request.getVenueNames().isEmpty()) {
            List<Venue> venues = venueRepository.findByNameIn(request.getVenueNames());
            for (Venue venue : venues) {
                if (!venue.getTemplates().contains(template)) {
                    venue.getTemplates().add(template);
                    venueRepository.save(venue);
                }
            }
        }

        return ApiResponse.success();
    }

    public List<TemplateDto> getTemplates(String venueName) {
        Venue venue = venueRepository.findByName(venueName)
                .orElseThrow(() -> new RuntimeException("Venue not found: " + venueName));

        return venue.getTemplates().stream()
                .map(templateMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Template getTemplateById(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
    }
}
