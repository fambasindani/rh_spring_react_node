package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class RetraiteResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private LocalDate dateRetraite;
    private String reference;
    private String observation;
}