package grad.microservice_auth.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EvaluationRequest {
    @NotNull private Long idAgent;
    @NotNull private LocalDate dateEvaluation;
    @NotNull @DecimalMin("0.0") @Max(20) private BigDecimal note;
    private String appreciation;
    private String evaluateur;
}