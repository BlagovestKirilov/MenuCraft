package bg.menucraft.util;

import bg.menucraft.model.TemplateSection;
import bg.menucraft.model.dto.TemplateSectionDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TemplateSectionMapper {
    TemplateSectionDto toDto(TemplateSection section);

    @Mapping(target = "template", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TemplateSection toEntity(TemplateSectionDto dto);
}
