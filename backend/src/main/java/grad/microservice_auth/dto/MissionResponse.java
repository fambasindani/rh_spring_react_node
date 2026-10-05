package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class MissionResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private String lieu;
    private String motif;
    private LocalDate dateDepart;
    private LocalDate dateRetour;
    private String reference;
}