package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DirectionRequest {
    @NotBlank(message = "Le sigle est obligatoire")
    private String sigle;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotNull(message = "Le statut est obligatoire")
    private Boolean statut;
}