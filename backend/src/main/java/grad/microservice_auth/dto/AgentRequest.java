package grad.microservice_auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Data
public class AgentRequest {

    @Size(max = 100, message = "Le matricule ne peut pas dépasser 100 caractères")
    private String matricule;

    @NotNull(message = "L'ID du grade est obligatoire")
    private Long idGrade;

    @NotNull(message = "L'ID de la fonction est obligatoire")
    private Long idFonction;

    @NotNull(message = "L'ID de la direction est obligatoire")
    private Long idDirection;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "Le postnom est obligatoire")
    @Size(max = 100, message = "Le postnom ne peut pas dépasser 100 caractères")
    private String postnom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    private String prenom;

    @NotBlank(message = "Le sexe est obligatoire")
    @Pattern(regexp = "^(M|F)$", message = "Le sexe doit être M ou F")
    @Size(max = 10, message = "Le sexe ne peut pas dépasser 10 caractères")
    private String sexe;

    @NotNull(message = "La date de naissance est obligatoire")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Size(max = 100, message = "L'email ne peut pas dépasser 100 caractères")
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    private String telephone;

    @NotBlank(message = "L'état civil est obligatoire")
    @Size(max = 20, message = "L'état civil ne peut pas dépasser 20 caractères")
    private String etatCivil;

    @NotNull(message = "Le statut est obligatoire")
    private Boolean statut;

    @NotBlank(message = "La référence d'engagement est obligatoire")
    @Size(max = 100, message = "La référence d'engagement ne peut pas dépasser 100 caractères")
    private String referenceEngagement;

    @NotNull(message = "La date d'engagement est obligatoire")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateEngagement;

    @NotBlank(message = "La province est obligatoire")
    @Size(max = 100, message = "La province ne peut pas dépasser 100 caractères")
    private String province;

    @NotBlank(message = "Le territoire est obligatoire")
    @Size(max = 100, message = "Le territoire ne peut pas dépasser 100 caractères")
    private String territoire;

    @NotBlank(message = "Le village est obligatoire")
    @Size(max = 100, message = "Le village ne peut pas dépasser 100 caractères")
    private String village;

  //  @NotBlank(message = "La photo est obligatoire")
    private String photo; // chemin renvoyé par l'upload
}