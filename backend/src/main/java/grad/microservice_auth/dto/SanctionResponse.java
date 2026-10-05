package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class SanctionResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private String typeSanction;
    private String motif;
    private LocalDate dateSanction;
    private String reference;
}