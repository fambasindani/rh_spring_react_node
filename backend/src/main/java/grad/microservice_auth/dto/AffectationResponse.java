package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AffectationResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPostnom;
    private String agentPrenom;
    private Long idDirection;
    private String directionSigle;
    private String directionNom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
}