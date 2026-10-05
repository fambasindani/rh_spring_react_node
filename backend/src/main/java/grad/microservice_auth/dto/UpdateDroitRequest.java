package grad.microservice_auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDroitRequest {
    private String nomDroit;
    private String description;
    private String module;
}
