package bg.menucraft.service;

import bg.menucraft.constant.Constants;
import bg.menucraft.constant.ExceptionConstants;
import bg.menucraft.constant.LoggingConstants;
import bg.menucraft.exception.DuplicateResourceException;
import bg.menucraft.exception.ResourceNotFoundException;
import bg.menucraft.model.Template;
import bg.menucraft.model.TemplateSection;
import bg.menucraft.model.Venue;
import bg.menucraft.model.dto.TemplateDto;
import bg.menucraft.model.request.AddTemplateRequest;
import bg.menucraft.model.response.ApiResponse;
import bg.menucraft.model.response.TemplateResponse;
import bg.menucraft.repository.TemplateRepository;
import bg.menucraft.repository.VenueRepository;
import bg.menucraft.util.TemplateMapper;
import bg.menucraft.util.TemplateSectionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Log4j2
@RequiredArgsConstructor
@Service
public class TemplateService {

    private static final String DEFAULT_CONTENT_TYPE = Constants.APPLICATION_PDF;

    private final TemplateRepository templateRepository;
    private final VenueRepository venueRepository;
    private final TemplateMapper templateMapper;
    private final TemplateSectionMapper templateSectionMapper;

    @Transactional
    public ApiResponse addTemplate(AddTemplateRequest request) {
        if (templateRepository.findByName(request.getName()).isPresent()) {
            log.warn(LoggingConstants.TEMPLATE_DUPLICATE, request.getName());
            throw new DuplicateResourceException(
                    String.format(ExceptionConstants.TEMPLATE_NAME_EXISTS, request.getName()));
        }

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

        log.info(LoggingConstants.TEMPLATE_ADDED, request.getName(), request.getVenueNames());

        return ApiResponse.success();
    }

    public TemplateResponse getTemplates(String venueName) {
        Venue venue = venueRepository.findByName(venueName)
                .orElseThrow(() -> {
                    log.warn(LoggingConstants.VENUE_NOT_FOUND, venueName);
                    return new ResourceNotFoundException(
                            String.format(ExceptionConstants.VENUE_NOT_FOUND, venueName));
                });

        List<TemplateDto> templates = venue.getTemplates().stream()
                .map(templateMapper::toDto)
                .toList();

        log.info(LoggingConstants.TEMPLATES_FETCHED, templates.size(), venueName);

        return new TemplateResponse(templates);
    }

    @Transactional(readOnly = true)
    public Template getTemplateById(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn(LoggingConstants.TEMPLATE_NOT_FOUND, id);
                    return new ResourceNotFoundException(
                            String.format(ExceptionConstants.TEMPLATE_NOT_FOUND, id));
                });
    }
}
