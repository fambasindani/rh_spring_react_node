package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FormationRequest {
    @NotBlank private String intitule;
    private String organisme;
    private String lieu;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String description;
    private Boolean statut;
}