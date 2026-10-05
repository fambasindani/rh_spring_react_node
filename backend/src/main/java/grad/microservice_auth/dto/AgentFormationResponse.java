package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AgentFormationResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private Long idFormation;
    private String formationIntitule;
    private String resultat;
    private String observation;
}