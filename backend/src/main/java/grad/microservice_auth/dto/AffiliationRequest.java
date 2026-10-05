package grad.microservice_auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AffiliationRequest {

    @NotNull(message = "L'ID de l'agent est obligatoire")
    private Long idAgent;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "Le postnom est obligatoire")
    @Size(max = 100, message = "Le postnom ne peut pas dépasser 100 caractères")
    private String postnom;

    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    private String prenom;

    @NotNull(message = "La date de naissance est obligatoire")
    @JsonProperty("date_naissance")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;

    @NotBlank(message = "Le lieu de naissance est obligatoire")
    @JsonProperty("lieu_naissance")
    @Size(max = 100, message = "Le lieu de naissance ne peut pas dépasser 100 caractères")
    private String lieuNaissance;

    @NotBlank(message = "L'état est obligatoire")
    @Pattern(regexp = "^(vivant|mort)$", message = "L'état doit être 'vivant' ou 'mort'")
    @Size(max = 10, message = "L'état ne peut pas dépasser 10 caractères")
    private String etat;

    @NotBlank(message = "La relation est obligatoire")
    @Size(max = 100, message = "La relation ne peut pas dépasser 100 caractères")
    private String relation;

    @NotNull(message = "Le statut est obligatoire")
    private Boolean statut;
}