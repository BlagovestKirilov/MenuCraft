package bg.menucraft.util;

import bg.menucraft.model.Template;
import bg.menucraft.model.dto.TemplateDto;
import bg.menucraft.model.request.AddTemplateRequest;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Base64;

@Mapper(componentModel = "spring")
public interface TemplateMapper {
    @Mapping(target = "data", ignore = true)
    @Mapping(target = "contentType", ignore = true)
    @Mapping(target = "sections", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Template toEntity(AddTemplateRequest request);

    @Mapping(target = "data", ignore = true)
    TemplateDto toDto(Template template);

    @AfterMapping
    default void encodeDataToBase64(@MappingTarget TemplateDto dto, Template template) {
        if (template.getData() != null && template.getData().length > 0) {
            dto.setData(Base64.getEncoder().encodeToString(template.getData()));
        }
    }
}
