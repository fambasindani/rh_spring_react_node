package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CongeStatusUpdateRequest {
    @NotNull
    private String statut; // ACCEPTE, REFUSE, ANNULE
}