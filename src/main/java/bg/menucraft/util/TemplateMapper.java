package bg.menucraft.util;

import bg.menucraft.model.Template;
import bg.menucraft.model.request.TemplateAddRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TemplateMapper {
    @Mapping(target = "data", ignore = true)
    @Mapping(target = "contentType", ignore = true)
    @Mapping(target = "sections", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Template toEntity(TemplateAddRequest request);
}
