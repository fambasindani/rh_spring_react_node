package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class EvaluationResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private LocalDate dateEvaluation;
    private BigDecimal note;
    private String appreciation;
    private String evaluateur;
}