package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AgentFormationRequest {
    @NotNull private Long idAgent;
    @NotNull private Long idFormation;
    private String resultat;
    private String observation;
}