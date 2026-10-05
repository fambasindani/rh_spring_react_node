package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PromotionResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPostnom;
    private String agentPrenom;
    private Long idGrade;
    private String gradeSigle;
    private String gradeNom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String reference;
}