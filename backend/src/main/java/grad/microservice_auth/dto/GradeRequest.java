package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GradeRequest {

    @NotBlank(message = "Le sigle est obligatoire")
    @Size(max = 10, message = "Le sigle ne peut pas dépasser 10 caractères")
    private String sigle;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nom;

    @NotNull(message = "Le statut est obligatoire")
    private Boolean statut;
}