package bg.menucraft.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class TemplateDto {

    private UUID id;
    private String name;
    private String description;
    private String data;
    private String contentType;
    private List<TemplateSectionDto> sections = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
