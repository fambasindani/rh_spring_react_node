package grad.microservice_auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DroitDTO {
    private Long id;
    private String nomDroit;
    private String description;
    private String module;
    private LocalDateTime dateCreation;
}
