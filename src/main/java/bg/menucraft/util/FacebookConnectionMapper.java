package bg.menucraft.util;

import bg.menucraft.model.FacebookConnection;
import bg.menucraft.model.dto.FacebookConnectionDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FacebookConnectionMapper {

    @Mapping(target = "status", expression = "java(connection.getStatus().name())")
    FacebookConnectionDto toDto(FacebookConnection connection);
}
