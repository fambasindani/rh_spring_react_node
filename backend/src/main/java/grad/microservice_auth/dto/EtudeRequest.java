package grad.microservice_auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EtudeRequest {

    @NotNull(message = "L'ID de l'agent est obligatoire")
    @JsonProperty("id_agent")  // ← ajouter cette annotation
    private Long idAgent;

    @JsonProperty("nombre_annee")  // ← modifier pour snake_case
    @NotNull(message = "Le nombre d'années est obligatoire")
    @Min(value = 0, message = "Le nombre d'années doit être positif ou nul")
    private Integer nombreAnnee;

    @NotBlank(message = "Le lieu est obligatoire")
    @Size(max = 100, message = "Le lieu ne peut pas dépasser 100 caractères")
    private String lieu;

    @NotBlank(message = "L'établissement est obligatoire")
    @Size(max = 100, message = "L'établissement ne peut pas dépasser 100 caractères")
    private String etablissement;
}