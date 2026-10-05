package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class FormationResponse {
    private Long id;
    private String intitule;
    private String organisme;
    private String lieu;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String description;
    private Boolean statut;
}