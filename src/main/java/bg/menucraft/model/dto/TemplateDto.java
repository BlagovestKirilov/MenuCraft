package bg.menucraft.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TemplateDto {
    private String name;
    private String description;
    private String data;
    private String contentType;
    private List<TemplateSectionDto> sections;
    private Instant createdAt;
    private Instant updatedAt;
}
