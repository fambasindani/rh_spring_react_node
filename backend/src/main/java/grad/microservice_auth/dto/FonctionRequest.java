package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FonctionRequest {
    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 250 caractères")
    private String nom;

    @NotNull(message = "Le statut est obligatoire")
    private Boolean statut;
}