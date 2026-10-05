package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDroitRequest {
    @NotBlank(message = "Le nom du droit est obligatoire")
    private String nomDroit;
    private String description;
    private String module;
}
